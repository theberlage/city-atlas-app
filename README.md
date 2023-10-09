# Project NL App

This repository contains the source code for the application presenting the results of the fall 2023 Project NL design-research project of the [Berlage Center for Advanced Studies in Architecture and Urban Design](https://theberlage.nl/) of TU Delft.

The application showcases the possiblities of [IIIF](https://iiif.io) and [Allmaps](https://allmaps.org). See also [this repository](https://github.com/theberlage/allmaps-workshop) outlining the introductory workshop in the beginning of the semester.

## File structure

The following file structure is used for the content (general introduction and individual projects):

```yml
- contents
  - overview
    - about
      - about.md # Markdown file containg a general introduction to the app
    - annotations # Folder containing georeferencing annotations shown on overview page
      - annotation.json
    - geojsons # Folder containing vectors loaded on overview page
      - locations.geojson # Sheet index used to navigate the projects
  - projects
    - [project-slug] # Each project has a dedicated folder. Use no spaces or caps for folder name
      - annotations # Folder containing georeferencing annotations for project
        - annotation.json
      - geojsons # Folder containing vectors for project (optional)
        - vector.geojson
      - slides # Folder with a collection of markdown files used for the slides
        - 01.md
        - 02.md
```

## File types

**Markdown with YAML frontmatter**

Markdown is a markup language to add formatting to plain text. [See this guide for more information](https://www.markdownguide.org/basic-syntax/). Each markdown file starts with a metadata block (also called *frontmatter*) in the YAML format, set between `---`. YAML is a 'human friendly' format to store data, [here's a tutorial](https://spacelift.io/blog/yaml).

Each slide contains the following frontmatter:

```yaml
meta: # Slide metadata
  heading: Subtitle # Slide heading
viewer: # Viewer settings
  bbox: [4.651103, 51.78665, 4.768242, 51.832353] # Viewer bounding box as can be exported from Placemark (Export > BBOX)
  rotation: 180 # Degrees
xyz:
  url: https://tile.openstreetmap.org/{z}/{x}/{y}.png # XZY url
  label: OpenStreetMap # Label for layer
geojson:
  - filename: vector-01.geojson # Filename of geojson in the project's geojsons/ folder
    label: Building outline # Optional label for vector
allmaps: # List of maps
  - label: Map # Label for map
    attribution: # Optional attribution
      name: Regionaal Archief Dordrecht
      url: https://www.regionaalarchiefdordrecht.nl
    annotation: annotation-01.json # Georef annotation filename in the project's annotations/ folder
    opacity: 100 # 0-100
    removeBackground:
      color: '#f0dbbc' # Hex color code
      threshold: 20 # 0-100
      hardness: 20 # 0-100
    colorize: '#8c00ff' # Hex color code
```

**GeoJSON**

JSON format to store geographic information. It can be exported from Placemark.

**Georeferencing Annotations**

JSON web annotation used by Allmaps to store the mask and control points of georeferenced maps available with IIIF.

## Development

This app uses [SvelteKit](https://kit.svelte.dev).

Requirements:

- Node v18.12.1

For development using `pnpm`:

`pnpm i` to install dependencies

`pnpm run dev` to start development server.

Production build:

`pnpm run build`
