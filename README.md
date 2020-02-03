# SOULVER-WEB

![IMG](soulver-web.gif)

![](https://img.shields.io/badge/type-JS_Library-brightgreen.svg "Project type")
![](https://img.shields.io/github/repo-size/LorenzoCorbella74/soulver-web "Repository size")
![](https://img.shields.io/github/package-json/v/LorenzoCorbella74/soulver-web)

A basic remake for the web of the [Soulver App](https://www.acqualia.com/soulver/) for Mac, made for studying purposes. I've always been fascinated by spreadsheets bindings and the interpretation of sentences written in natural language and soulver-web is my effort in Vanilla Javascript to combine these two inputs. Just type in the white blackboard and the math operations will produce results in the grey right column.

## Features and TODOs
- [x] Basic styling for numbers, currencies, comments (by writing `// xxxxxx..`) and bold headers (by writing `# xxxxx..`)
- [x] expressions parsing, math functions and operations thanks to [math.js](https://mathjs.org/)
- [x] SI Notation: `k` for thousands, `M` for millions
- [x] Inline variables declared using the equals sign
- [x] currencies (right now `EUR`, `USD` and `GBP` are supported) 
- [x] binding with rows results (by writing `R and rownumber` or by pressing `+` in a blank new row) with auto update
- [x] writing `total` in a blank new row sums the previous results (with auto update)
- [ ] Unit Conversions
- [ ] Calendar math
- [x] Percentages expressed with natural functions (10% of 20, 10 +/- 20%)
- [ ] Number formatting
- [x] Import and export sheets in .json format
- [x] Black theme

## Demo
[check the app online](https://festive-lalande-0b44f6.netlify.com/) or to test things locally just install dependancies with `npm i`
and run the local server with `npm start`.  SVG Icons courtesy from [svgicons.sparkk](http://svgicons.sparkk.fr/).

## Bugs
- Uhm, many...!

## License
This project is licensed under the ISC License.