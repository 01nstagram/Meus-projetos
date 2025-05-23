extern crate proc_macro;

use syn::parse::Parser;
use syn::punctuated::Punctuated;
use syn::spanned::Spanned;

#[proc_macro_derive(Asn1Read, attributes(explicit, implicit, default, defined_by))]
pub fn derive_asn1_read(input: proc_macro::TokenStream) -> proc_macro::TokenStream {
    let input = syn::parse_macro_input!(input as syn::DeriveInput);

    let name = input.ident;
    let (_, ty_generics, _) = input.generics.split_for_impl();
    let mut generics = input.generics.clone();
    let lifetime_name = add_lifetime_if_none(&mut generics);
    add_bounds(
        &mut generics,
        all_field_types(&input.data),
        syn::parse_quote!(asn1::Asn1Readable<#lifetime_name>),
        syn::parse_quote!(asn1::Asn1DefinedByReadable<#lifetime_name, asn1::ObjectIdentifier>),
        false,
    );
    let (impl_generics, _, where_clause) = generics.split_for_impl();

    let expanded = match input.data {
        syn::Data::Struct(data) => {
            let read_block = generate_struct_read_block(&name, &data);
            quote::quote! {
                impl #impl_generics asn1::SimpleAsn1Readable<#lifetime_name> for #name #ty_generics #where_clause {
                    const TAG: asn1::Tag = <asn1::Sequence as asn1::SimpleAsn1Readable>::TAG;
                    fn parse_data(data: &#lifetime_name [u8]) -> asn1::ParseResult<Self> {
                        asn1::parse(data, |p| { #read_block })
                    }
                }
            }
        }
        syn::Data::Enum(data) => {
            let (read_block, can_parse_block) = generate_enum_read_block(&name, &data);
            quote::quote! {
                impl #impl_generics asn1::Asn1Readable<#lifetime_name> for #name #ty_generics #where_clause {
                    fn parse(parser: &mut asn1::Parser<#lifetime_name>) -> asn1::ParseResult<Self> {
                        let tlv = parser.read_element::<asn1::Tlv>()?;
                        #read_block
                        Err(asn1::ParseError::new(asn1::ParseErrorKind::UnexpectedTag{actual: tlv.tag()}))
                    }

                    fn can_parse(tag: asn1::Tag) -> bool {
                        #can_parse_block
                        false
                    }
                }
            }
        }
        _ => unimplemented!("Not supported for unions"),
    };

    proc_macro::TokenStream::from(expanded)
}

#[proc_macro_derive(Asn1Write, attributes(explicit, implicit, default, defined_by))]
pub fn derive_asn1_write(input: proc_macro::TokenStream) -> proc_macro::TokenStream {
    let mut input = syn::parse_macro_input!(input as syn::DeriveInput);

    let name = input.ident;
    add_bounds(
        &mut input.generics,
        all_field_types(&input.data),
        syn::parse_quote!(asn1::Asn1Writable),
        syn::parse_quote!(asn1::Asn1DefinedByWritable<asn1::ObjectIdentifier>),
        true,
    );
    let (impl_generics, ty_generics, where_clause) = input.generics.split_for_impl();

    let expanded = match input.data {
        syn::Data::Struct(data) => {
            let write_block = generate_struct_write_block(&data);
            quote::quote! {
                impl #impl_generics asn1::SimpleAsn1Writable for #name #ty_generics #where_clause {
                    const TAG: asn1::Tag = <asn1::SequenceWriter as asn1::SimpleAsn1Writable>::TAG;
                    fn write_data(&self, dest: &mut asn1::WriteBuf) -> asn1::WriteResult {
                        #write_block

                        Ok(())
                    }
                }
            }
        }
        syn::Data::Enum(data) => {
            let write_block = generate_enum_write_block(&name, &data);
            quote::quote! {
                impl #impl_generics asn1::Asn1Writable for #name #ty_generics #where_clause {
                    fn write(&self, w: &mut asn1::Writer) -> asn1::WriteResult {
                        #write_block
                    }
                }

                impl #impl_generics asn1::Asn1Writable for &#name #ty_generics #where_clause {
                    fn write(&self, w: &mut asn1::Writer) -> asn1::WriteResult {
                        (*self).write(w)
                    }
                }
            }
        }
        _ => unimplemented!("Not supported for unions"),
    };

    proc_macro::TokenStream::from(expanded)
}

enum DefinedByVariant {
    DefinedBy(syn::Path, bool),
    Default,
}

fn extract_defined_by_property(variant: &syn::Variant) -> DefinedByVariant {
    if variant.attrs.iter().any(|a| a.path().is_ident("default")) {
        return DefinedByVariant::Default;
    }
    let has_field = match &variant.fields {
        syn::Fields::Unnamed(fields) => {
            assert!(fields.unnamed.len() == 1);
            true
        }
        syn::Fields::Unit => false,
        _ => panic!("enum elements must have a single field"),
    };

    DefinedByVariant::DefinedBy(
        variant
            .attrs
            .iter()
            .find_map(|a| {
                if a.path().is_ident("defined_by") {
                    Some(a.parse_args::<syn::Path>().unwrap())
                } else {
                    None
                }
            })
            .expect("Variant must have #[defined_by]"),
        has_field,
    )
}

#[proc_macro_derive(Asn1DefinedByRead, attributes(default, defined_by))]
pub fn derive_asn1_defined_by_read(input: proc_macro::TokenStream) -> proc_macro::TokenStream {
    let input = syn::parse_macro_input!(input as syn::DeriveInput);

    let name = input.ident;
    let (_, ty_generics, where_clause) = input.generics.split_for_impl();
    let mut generics = input.generics.clone();
    let lifetime_name = add_lifetime_if_none(&mut generics);
    let (impl_generics, _, _) = generics.split_for_impl();

    let mut read_block = vec![];
    let mut default_ident = None;

    match &input.data {
        syn::Data::Enum(data) => {
            for variant in &data.variants {
                let ident = &variant.ident;
                match extract_defined_by_property(variant) {
                    DefinedByVariant::DefinedBy(defined_by, has_field) => {
                        let read_op = if has_field {
                            quote::quote! { #name::#ident(parser.read_element()?) }
                        } else {
                            quote::quote! { #name::#ident }
                        };

                        read_block.push(quote::quote! {
                            if item == #defined_by {
                                return Ok(#read_op);
                            }
                        });
                    }
                    DefinedByVariant::Default => {
                        assert!(default_ident.is_none());
                        default_ident = Some(ident);
                    }
                };
            }
        }
        _ => panic!("Only support for enums"),
    }

    let fallback_block = if let Some(ident) = default_ident {
        quote::quote! {
            Ok(#name::#ident(item, parser.read_element()?))
        }
    } else {
        quote::quote! {
            Err(asn1::ParseError::new(asn1::ParseErrorKind::UnknownDefinedBy))
        }
    };
    proc_macro::TokenStream::from(quote::quote! {
        impl #impl_generics asn1::Asn1DefinedByReadable<#lifetime_name, asn1::ObjectIdentifier> for #name #ty_generics #where_clause {
            fn parse(item: asn1::ObjectIdentifier, parser: &mut asn1::Parser<#lifetime_name>) -> asn1::ParseResult<Self> {
                #(#read_block)*

                #fallback_block
            }
        }
    })
}

#[proc_macro_derive(Asn1DefinedByWrite, attributes(default, defined_by))]
pub fn derive_asn1_defined_by_write(input: proc_macro::TokenStream) -> proc_macro::TokenStream {
    let input = syn::parse_macro_input!(input as syn::DeriveInput);

    let name = input.ident;
    let (impl_generics, ty_generics, where_clause) = input.generics.split_for_impl();

    let mut write_blocks = vec![];
    let mut item_blocks = vec![];
    match &input.data {
        syn::Data::Enum(data) => {
            for variant in &data.variants {
                let ident = &variant.ident;
                match extract_defined_by_property(variant) {
                    DefinedByVariant::DefinedBy(defined_by, has_field) => {
                        if has_field {
                            write_blocks.push(quote::quote! {
                                #name::#ident(value) => w.write_element(value),
                            });
                            item_blocks.push(quote::quote! {
                                #name::#ident(..) => &#defined_by,
                            });
                        } else {
                            write_blocks.push(quote::quote! {
                                #name::#ident => { Ok(()) },
                            });
                            item_blocks.push(quote::quote! {
                                #name::#ident => &#defined_by,
                            });
                        }
                    }
                    DefinedByVariant::Default => {
                        write_blocks.push(quote::quote! {
                            #name::#ident(_, value) => w.write_element(value),
                        });
                        item_blocks.push(quote::quote! {
                            #name::#ident(defined_by, _) => &defined_by,
                        });
                    }
                };
            }
        }
        _ => panic!("Only support for enums"),
    }

    proc_macro::TokenStream::from(quote::quote! {
        impl #impl_generics asn1::Asn1DefinedByWritable<asn1::ObjectIdentifier> for #name #ty_generics #where_clause {
            fn item(&self) -> &asn1::ObjectIdentifier {
                match self {
                    #(#item_blocks)*
                }
            }

            fn write(&self, w: &mut asn1::Writer) -> asn1::WriteResult {
                match self {
                    #(#write_blocks)*
                }
            }
        }
    })
}

fn add_lifetime_if_none(generics: &mut syn::Generics) -> syn::Lifetime {
    if generics.lifetimes().next().is_none() {
        generics
            .params
            .push(syn::GenericParam::Lifetime(syn::LifetimeParam::new(
                syn::Lifetime::new("'a", proc_macro2::Span::call_site()),
            )));
    };

    generics.lifetimes().next().unwrap().lifetime.clone()
}

fn all_field_types(data: &syn::Data) -> Vec<(syn::Type, OpType, bool)> {
    let mut field_types = vec![];
    match data {
        syn::Data::Struct(v) => {
            add_field_types(&mut field_types, &v.fields, None);
        }
        syn::Data::Enum(v) => {
            for variant in &v.variants {
                let (op_type, _) = extract_field_properties(&variant.attrs);
                add_field_types(&mut field_types, &variant.fields, Some(op_type));
            }
        }
        syn::Data::Union(_) => panic!("Unions not supported"),
    }
    field_types
}

fn add_field_types(
    field_types: &mut Vec<(syn::Type, OpType, bool)>,
    fields: &syn::Fields,
    op_type: Option<OpType>,
) {
    match fields {
        syn::Fields::Named(v) => {
            for f in &v.named {
                add_field_type(field_types, f, op_type.clone());
            }
        }
        syn::Fields::Unnamed(v) => {
            for f in &v.unnamed {
                add_field_type(field_types, f, op_type.clone());
            }
        }
        syn::Fields::Unit => {}
    }
}

fn add_field_type(
    field_types: &mut Vec<(syn::Type, OpType, bool)>,
    f: &syn::Field,
    op_type: Option<OpType>,
) {
    // If we have an op_type here, it means it came from an enum variant. In
    // that case, even though it wasn't marked "required", it is for the
    // purposes of how we're using it.
    let (op_type, default) = if let Some(OpType::Explicit(mut args)) = op_type {
        args.required = true;
        (OpType::Explicit(args), None)
    } else if let Some(OpType::Implicit(mut args)) = op_type {
        args.required = true;
        (OpType::Implicit(args), None)
    } else {
        extract_field_properties(&f.attrs)
    };
    field_types.push((f.ty.clone(), op_type, default.is_some()));
}

fn add_bounds(
    generics: &mut syn::Generics,
    field_types: Vec<(syn::Type, OpType, bool)>,
    bound: syn::TypeParamBound,
    defined_by_bound: syn::TypeParamBound,
    add_ref: bool,
) {
    let where_clause = if field_types.is_empty() {
        return;
    } else {
        generics
            .where_clause
            .get_or_insert_with(|| syn::WhereClause {
                where_token: Default::default(),
                predicates: syn::punctuated::Punctuated::new(),
            })
    };

    for (f, op_type, has_default) in field_types {
        let (bounded_ty, required_bound) = match (op_type, add_ref) {
            (OpType::Regular, _) => (f, bound.clone()),
            (OpType::DefinedBy(_), _) => (f, defined_by_bound.clone()),

            (OpType::Implicit(OpTypeArgs { value, required }), false) => {
                let ty = if required || has_default {
                    syn::parse_quote!(asn1::Implicit::<#f, #value>)
                } else {
                    syn::parse_quote!(asn1::Implicit::<<#f as asn1::OptionExt>::T, #value>)
                };

                (ty, bound.clone())
            }
            (OpType::Implicit(OpTypeArgs { value, required }), true) => {
                let ty = if required || has_default {
                    syn::parse_quote!(for<'asn1_internal> asn1::Implicit::<&'asn1_internal #f, #value>)
                } else {
                    syn::parse_quote!(for<'asn1_internal> asn1::Implicit::<&'asn1_internal <#f as asn1::OptionExt>::T, #value>)
                };

                (ty, bound.clone())
            }

            (OpType::Explicit(OpTypeArgs { value, required }), false) => {
                let ty = if required || has_default {
                    syn::parse_quote!(asn1::Explicit::<#f, #value>)
                } else {
                    syn::parse_quote!(asn1::Explicit::<<#f as asn1::OptionExt>::T, #value>)
                };

                (ty, bound.clone())
            }
            (OpType::Explicit(OpTypeArgs { value, required }), true) => {
                let ty = if required || has_default {
                    syn::parse_quote!(for<'asn1_internal> asn1::Explicit::<&'asn1_internal #f, #value>)
                } else {
                    syn::parse_quote!(for<'asn1_internal> asn1::Explicit::<&'asn1_internal <#f as asn1::OptionExt>::T, #value>)
                };

                (ty, bound.clone())
            }
        };

        where_clause
            .predicates
            .push(syn::WherePredicate::Type(syn::PredicateType {
                lifetimes: None,
                bounded_ty,
                colon_token: Default::default(),
                bounds: {
                    let mut p = syn::punctuated::Punctuated::new();
                    p.push(required_bound);
                    p
                },
            }))
    }
}

#[derive(Clone)]
enum OpType {
    Regular,
    Explicit(OpTypeArgs),
    Implicit(OpTypeArgs),
    DefinedBy(syn::Ident),
}

#[derive(Clone)]
struct OpTypeArgs {
    value: proc_macro2::Literal,
    required: bool,
}

impl syn::parse::Parse for OpTypeArgs {
    fn parse(input: syn::parse::ParseStream) -> syn::Result<Self> {
        let value = input.parse::<proc_macro2::Literal>()?;
        let required = if input.lookahead1().peek(syn::Token![,]) {
            input.parse::<syn::Token![,]>()?;
            assert_eq!(input.parse::<syn::Ident>()?, "required");
            true
        } else {
            false
        };
        Ok(OpTypeArgs { value, required })
    }
}

fn extract_field_properties(attrs: &[syn::Attribute]) -> (OpType, Option<syn::Expr>) {
    let mut op_type = OpType::Regular;
    let mut default = None;
    for attr in attrs {
        if attr.path().is_ident("explicit") {
            if let OpType::Regular = op_type {
                op_type = OpType::Explicit(attr.parse_args::<OpTypeArgs>().unwrap());
            } else {
                panic!("Can't specify #[explicit] or #[implicit] more than once")
            }
        } else if attr.path().is_ident("implicit") {
            if let OpType::Regular = op_type {
                op_type = OpType::Implicit(attr.parse_args::<OpTypeArgs>().unwrap());
            } else {
                panic!("Can't specify #[explicit] or #[implicit] more than once")
            }
        } else if attr.path().is_ident("default") {
            assert!(default.is_none(), "Can't specify #[default] more than once");
            default = Some(attr.parse_args::<syn::Expr>().unwrap());
        } else if attr.path().is_ident("defined_by") {
            op_type = OpType::DefinedBy(attr.parse_args::<syn::Ident>().unwrap());
        }
    }

    (op_type, default)
}

fn generate_read_element(
    struct_name: &syn::Ident,
    f: &syn::Field,
    f_name: &str,
    is_defined_by_marker: bool,
) -> proc_macro2::TokenStream {
    let (read_type, default) = extract_field_properties(&f.attrs);

    let error_location = format!("{}::{}", struct_name, f_name);
    let add_error_location = quote::quote! {
        .map_err(|e| e.add_location(asn1::ParseLocation::Field(#error_location)))
    };
    let mut read_op = match read_type {
        OpType::Explicit(arg) => {
            let value = arg.value;
            if arg.required {
                quote::quote! {
                    p.read_element::<asn1::Explicit<_, #value>>()#add_error_location?.into_inner()
                }
            } else {
                quote::quote! {
                    p.read_element::<Option<asn1::Explicit<_, #value>>>()#add_error_location?.map(asn1::Explicit::into_inner)
                }
            }
        }
        OpType::Implicit(arg) => {
            let value = arg.value;
            if arg.required {
                quote::quote! {
                    p.read_element::<asn1::Implicit<_, #value>>()#add_error_location?.into_inner()
                }
            } else {
                quote::quote! {
                    p.read_element::<Option<asn1::Implicit<_, #value>>>()#add_error_location?.map(asn1::Implicit::into_inner)
                }
            }
        }
        OpType::Regular => {
            if is_defined_by_marker {
                let f = syn::Ident::new(f_name, proc_macro2::Span::call_site());
                quote::quote! {{
                    #f = p.read_element()#add_error_location?;
                    asn1::DefinedByMarker::marker()
                }}
            } else {
                quote::quote! {
                    p.read_element()#add_error_location?
                }
            }
        }
        OpType::DefinedBy(ident) => quote::quote! {
            asn1::read_defined_by(#ident, p)#add_error_location?
        },
    };
    if let Some(default) = default {
        let f_type = &f.ty;
        read_op = quote::quote! {{
            asn1::from_optional_default::<#f_type>(#read_op, #default.into())#add_error_location?
        }};
    }
    read_op
}

fn generate_struct_read_block(
    struct_name: &syn::Ident,
    data: &syn::DataStruct,
) -> proc_macro2::TokenStream {
    match data.fields {
        syn::Fields::Named(ref fields) => {
            let defined_by_markers = fields
                .named
                .iter()
                .filter_map(|f| {
                    let (op_type, _) = extract_field_properties(&f.attrs);
                    match op_type {
                        OpType::DefinedBy(ident) => Some(ident),
                        _ => None,
                    }
                })
                .collect::<Vec<_>>();

            let defined_by_markers_definitions = defined_by_markers.iter().map(|f| {
                quote::quote! {
                    let #f;
                }
            });

            let recurse = fields.named.iter().map(|f| {
                let name = &f.ident;
                let is_defined_by_marker = name
                    .as_ref()
                    .map_or(false, |n| defined_by_markers.contains(n));
                let read_op = generate_read_element(
                    struct_name,
                    f,
                    &format!("{}", name.as_ref().unwrap()),
                    is_defined_by_marker,
                );
                quote::quote_spanned! {f.span() =>
                    #name: #read_op,
                }
            });

            quote::quote! {
                #(#defined_by_markers_definitions)*

                Ok(Self {
                    #(#recurse)*
                })
            }
        }
        syn::Fields::Unnamed(ref fields) => {
            let recurse = fields.unnamed.iter().enumerate().map(|(i, f)| {
                let read_op = generate_read_element(struct_name, f, &format!("{}", i), false);
                quote::quote_spanned! {f.span() =>
                    #read_op,
                }
            });

            quote::quote! {
                Ok(Self(
                    #(#recurse)*
                ))
            }
        }
        syn::Fields::Unit => {
            quote::quote! { Ok(Self) }
        }
    }
}

fn generate_enum_read_block(
    name: &syn::Ident,
    data: &syn::DataEnum,
) -> (proc_macro2::TokenStream, proc_macro2::TokenStream) {
    let mut read_blocks = vec![];
    let mut can_parse_blocks = vec![];

    for variant in &data.variants {
        let field = match &variant.fields {
            syn::Fields::Unnamed(fields) => {
                assert_eq!(fields.unnamed.len(), 1);
                &fields.unnamed[0]
            }
            _ => panic!("enum elements must have a single field"),
        };
        let (op_type, default) = extract_field_properties(&variant.attrs);
        assert!(default.is_none());

        let ty = &field.ty;
        let ident = &variant.ident;

        let error_location = format!("{}::{}", name, ident);
        let add_error_location = quote::quote! {
            .map_err(|e| e.add_location(asn1::ParseLocation::Field(#error_location)))
        };
        match op_type {
            OpType::Regular => {
                read_blocks.push(quote::quote! {
                    if <#ty>::can_parse(tlv.tag()) {
                        return Ok(#name::#ident(tlv.parse()#add_error_location?));
                    }
                });
                can_parse_blocks.push(quote::quote! {
                    if <#ty>::can_parse(tag) {
                        return true;
                    }
                });
            }
            OpType::Explicit(arg) => {
                let tag = arg.value;
                read_blocks.push(quote::quote! {
                    if asn1::Explicit::<#ty, #tag>::can_parse(tlv.tag()) {
                        return Ok(#name::#ident(asn1::parse(
                            tlv.full_data(),
                            |p| Ok(p.read_element::<asn1::Explicit<_, #tag>>()#add_error_location?.into_inner())
                        )?))
                    }
                });
                can_parse_blocks.push(quote::quote! {
                    if asn1::Explicit::<#ty, #tag>::can_parse(tag) {
                        return true;
                    }
                });
            }
            OpType::Implicit(arg) => {
                let tag = arg.value;
                read_blocks.push(quote::quote! {
                    if asn1::Implicit::<#ty, #tag>::can_parse(tlv.tag()) {
                        return Ok(#name::#ident(asn1::parse(
                            tlv.full_data(),
                            |p| Ok(p.read_element::<asn1::Implicit<_, #tag>>()#add_error_location?.into_inner())
                        )?))
                    }
                });
                can_parse_blocks.push(quote::quote! {
                    if asn1::Implicit::<#ty, #tag>::can_parse(tag) {
                        return true;
                    }
                });
            }
            OpType::DefinedBy(_) => panic!("Can't use #[defined_by] in an Asn1Read on an enum"),
        };
    }

    let read_block = quote::quote! {
        #(#read_blocks)*
    };
    let can_parse_block = quote::quote! {
        #(#can_parse_blocks)*
    };
    (read_block, can_parse_block)
}

fn generate_write_element(
    f: &syn::Field,
    mut field_read: proc_macro2::TokenStream,
    defined_by_marker_origin: Option<proc_macro2::TokenStream>,
) -> proc_macro2::TokenStream {
    let (write_type, default) = extract_field_properties(&f.attrs);

    if let Some(default) = default {
        field_read = quote::quote! {&{
            asn1::to_optional_default(#field_read, &(#default).into())
        }}
    }

    match write_type {
        OpType::Explicit(arg) => {
            let value = arg.value;
            if arg.required {
                quote::quote_spanned! {f.span() =>
                    w.write_element(&asn1::Explicit::<_, #value>::new(#field_read))?;
                }
            } else {
                quote::quote_spanned! {f.span() =>
                    if let Some(v) = #field_read {
                        w.write_element(&asn1::Explicit::<_, #value>::new(v))?;
                    }
                }
            }
        }
        OpType::Implicit(arg) => {
            let value = arg.value;
            if arg.required {
                quote::quote_spanned! {f.span() =>
                    w.write_element(&asn1::Implicit::<_, #value>::new(#field_read))?;
                }
            } else {
                quote::quote_spanned! {f.span() =>
                    if let Some(v) = #field_read {
                        w.write_element(&asn1::Implicit::<_, #value>::new(v))?;
                    }
                }
            }
        }
        OpType::Regular => {
            if let Some(defined_by_marker_read) = defined_by_marker_origin {
                quote::quote! {
                    w.write_element(asn1::writable_defined_by_item(#defined_by_marker_read))?;
                }
            } else {
                quote::quote! {
                    w.write_element(#field_read)?;
                }
            }
        }
        OpType::DefinedBy(_) => quote::quote! {
            asn1::write_defined_by(#field_read, &mut w)?;
        },
    }
}

fn generate_struct_write_block(data: &syn::DataStruct) -> proc_macro2::TokenStream {
    match data.fields {
        syn::Fields::Named(ref fields) => {
            let defined_by_markers = fields
                .named
                .iter()
                .filter_map(|f| {
                    let (op_type, _) = extract_field_properties(&f.attrs);
                    match op_type {
                        OpType::DefinedBy(ident) => Some((ident, &f.ident)),
                        _ => None,
                    }
                })
                .collect::<std::collections::hash_map::HashMap<_, _>>();

            let recurse = fields.named.iter().map(|f| {
                let name = &f.ident;
                let defined_by_marker_origin = name.as_ref().and_then(|n| {
                    defined_by_markers.get(n).map(|v| {
                        quote::quote! { &self.#v }
                    })
                });
                generate_write_element(f, quote::quote! { &self.#name }, defined_by_marker_origin)
            });

            quote::quote! {
                let mut w = asn1::Writer::new(dest);
                #(#recurse)*
            }
        }
        syn::Fields::Unnamed(ref fields) => {
            let recurse = fields.unnamed.iter().enumerate().map(|(i, f)| {
                let index = syn::Index::from(i);
                generate_write_element(f, quote::quote! { &self.#index }, None)
            });

            quote::quote! {
                let mut w = asn1::Writer::new(dest);
                #(#recurse)*
            }
        }
        syn::Fields::Unit => {
            quote::quote! {}
        }
    }
}

fn generate_enum_write_block(name: &syn::Ident, data: &syn::DataEnum) -> proc_macro2::TokenStream {
    let write_arms = data.variants.iter().map(|v| {
        match &v.fields {
            syn::Fields::Unnamed(fields) => {
                assert_eq!(fields.unnamed.len(), 1);
            }
            _ => panic!("enum elements must have a single field"),
        };
        let (op_type, default) = extract_field_properties(&v.attrs);
        assert!(default.is_none());
        let ident = &v.ident;

        match op_type {
            OpType::Regular => {
                quote::quote! {
                    #name::#ident(value) => w.write_element(value),
                }
            }
            OpType::Explicit(arg) => {
                let tag = arg.value;
                quote::quote! {
                    #name::#ident(value) => w.write_element(&asn1::Explicit::<_, #tag>::new(value)),
                }
            }
            OpType::Implicit(arg) => {
                let tag = arg.value;
                quote::quote! {
                    #name::#ident(value) => w.write_element(&asn1::Implicit::<_, #tag>::new(value)),
                }
            }
            OpType::DefinedBy(_) => panic!("Can't use #[defined_by] in an Asn1Write on an enum"),
        }
    });
    quote::quote! {
        match self {
            #(#write_arms)*
        }
    }
}

// TODO: Duplicate of this function in src/object_identifier.rs, can we
// de-dupe?
fn _write_base128_int(data: &mut Vec<u8>, n: u128) {
    if n == 0 {
        data.push(0);
        return;
    }

    let mut l = 0;
    let mut i = n;
    while i > 0 {
        l += 1;
        i >>= 7;
    }

    for i in (0..l).rev() {
        let mut o = (n >> (i * 7)) as u8;
        o &= 0x7f;
        if i != 0 {
            o |= 0x80;
        }
        data.push(o);
    }
}

#[proc_macro]
pub fn oid(item: proc_macro::TokenStream) -> proc_macro::TokenStream {
    let p_arcs = Punctuated::<syn::LitInt, syn::Token![,]>::parse_terminated
        .parse(item)
        .unwrap();
    let mut arcs = p_arcs.iter();

    let mut der_encoded = vec![];
    let first = arcs.next().unwrap().base10_parse::<u128>().unwrap();
    let second = arcs.next().unwrap().base10_parse::<u128>().unwrap();
    _write_base128_int(&mut der_encoded, 40 * first + second);
    for arc in arcs {
        _write_base128_int(&mut der_encoded, arc.base10_parse::<u128>().unwrap());
    }

    let der_len = der_encoded.len();
    // TODO: is there a way to use the `MAX_OID_LENGTH` constant here?
    assert!(der_len <= 63);
    der_encoded.resize(63, 0);
    let der_lit = syn::LitByteStr::new(&der_encoded, proc_macro2::Span::call_site());
    let expanded = quote::quote! {
        asn1::ObjectIdentifier::from_der_unchecked(*#der_lit, #der_len as u8)
    };

    proc_macro::TokenStream::from(expanded)
}
