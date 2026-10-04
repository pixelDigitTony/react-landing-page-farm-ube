import { Presentation } from '@oai/artifact-tool'
const p = Presentation.create({slideSize:{width:1280,height:720}})
console.log(p.help('*',{search:'TextStyleConfig|table cell margins|tables.add',include:['index','notes'],maxChars:5000}).ndjson)
