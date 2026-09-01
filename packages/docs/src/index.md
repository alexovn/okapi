---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: Okapi
  text: A library for handling API and HTTP errors with ease
  tagline: Know Your Errors By Sight
  image:
    light: /okapi-logo-black.svg
    dark: /okapi-logo-white.svg
    alt: 'Okapi'
  actions:
    - theme: brand
      text: Get Started
      link: /introduction
    # - theme: alt
    #   text: Examples8
    #   link: /examples

features:
  - icon: 🛠️
    title: Framework Agnostic
    details: Handles any JavaScript frameworks (Vue, React, Angular etc.)
  - icon:
      src: /logos/ts.svg
      alt: TypeScript logo
      width: '28px'
      height: '28px'
      wrap: true
    title: Type Safe
    details: Full TypeScript support
  - icon: 🌎
    title: i18n Support
    details: Users will know about errors in their language
  - icon: 🧩
    title: Fetch adapters
    details: Built-in helpers for Axios, ofetch, native fetch etc.
  - icon: 🎛️
    title: Customizable
    details: Supports a wide range of customization options
---
