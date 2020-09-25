const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
const en = (new Date()).toLocaleDateString('en-US', options)
const ja = (new Date()).toLocaleDateString('ja-JP', options)

console.log('en: '+en)
console.log('ja: '+ja)
console.log(process.config.variables)

console.log('::set-output name=en::'+en)
console.log('::set-output name=ja::'+ja)
