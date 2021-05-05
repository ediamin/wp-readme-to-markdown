const fs = require('fs')
const util = require('util')

const argv = require('minimist')(process.argv.slice(2), {
  string: [
    'readme',
    'md',
    'screenshot-url'
  ]
})

const readme = argv.readme || 'readme.txt'
const md = argv.md || 'README.md'
const screenshotUrl = argv['screenshot-url']

if (!fs.existsSync(readme)) {
  console.log(util.format('Source file "%s" not found.', readme))
  process.exit()
}

fs.readFile(readme, 'utf8', (error, readmeTxt) => {
  if (error) {
    throw error
  }

  // Convert Headings
  readmeTxt = readmeTxt.replace(new RegExp(/^=([^=]+)=*?[\\s ]*?$/, 'gim'), '###$1###')
  readmeTxt = readmeTxt.replace(new RegExp(/^==([^=]+)==*?[\\s ]*?$/, 'gim'), '##$1##')
  readmeTxt = readmeTxt.replace(new RegExp(/^===([^=]+)===*?[\\s ]*?$/, 'gim'), '#$1#')

  // parse contributors, donate link, etc.
  const headerMatch = readmeTxt.match(new RegExp(/([^##]*)(?:\n##|$)/, 'm'))
  if (headerMatch && headerMatch.length >= 1) {
    const headerSearch = headerMatch[1]
    const headerReplace = headerSearch.replace(new RegExp('^([^:\r\n*]{1}[^:\r\n#\\]\\[]+): (.+)', 'gim'), '**$1:** $2  ') // eslint-disable-line no-control-regex
    readmeTxt = readmeTxt.replace(headerSearch, headerReplace)
  }

  // Include w.org profiles for contributors.
  const contributorsMatch = readmeTxt.match(new RegExp('(\\*\\*Contributors:\\*\\* )(.+)', 'm'))
  if (contributorsMatch && contributorsMatch.length >= 1) {
    const contributorsSearch = contributorsMatch[0]
    let contributorsReplace = contributorsMatch[1]
    const profiles = []

    // Fill profiles.
    contributorsMatch[2].split(',').forEach((value) => {
      value = value.trim()
      profiles.push('[' + value + '](https://profiles.wordpress.org/' + value + '/)')
    })

    contributorsReplace += profiles.join(', ')

    // Add line break.
    contributorsReplace += '  '

    readmeTxt = readmeTxt.replace(contributorsSearch, contributorsReplace)
  }

  // guess plugin slug from plugin name
  // @todo Get this from config instead?
  const _match = readmeTxt.match(new RegExp('^#([^#]+)#[\\s ]*?$', 'im'))

  // process screenshots, if any
  const screenshotMatch = readmeTxt.match(new RegExp('## Screenshots ##([^#]*)', 'im'))
  if (screenshotUrl && _match && screenshotMatch && screenshotMatch.length > 1) {
    const plugin = _match[1].trim().toLowerCase().replace(/ /g, '-')

    // Collect screenshots content
    const screenshots = screenshotMatch[1]

    // parse screenshot list into array
    const globalMatch = screenshots.match(new RegExp('^[0-9]+\\. (.*)', 'gim'))

    const matchArray = []
    let nonGlobalMatch, i
    for (i in globalMatch) {
      nonGlobalMatch = globalMatch[i].match(new RegExp('^[0-9]+\\. (.*)', 'im'))
      matchArray.push(nonGlobalMatch[1])
    }

    // replace list item with markdown image syntax, hotlinking to plugin repo
    // @todo assumes .png, perhaps should check that file exists first?
    for (i = 1; i <= matchArray.length; i++) {
      let url = screenshotUrl
      url = url.replace('{plugin}', plugin)
      url = url.replace('{screenshot}', 'screenshot-' + i)
      readmeTxt = readmeTxt.replace(globalMatch[i - 1], '### ' + i + '. ' + matchArray[i - 1] + ' ###\n![' + matchArray[i - 1] + '](' + url + ')\n')
    }
  }

  // Code blocks
  readmeTxt = readmeTxt.replace(new RegExp('^`$[\n\r]+([^`]*)[\n\r]+^`$', 'gm'), (codeblock, codeblockContents) => { // eslint-disable-line no-control-regex
    const lines = codeblockContents.split('\n')
    // Add newline and indent all lines in the codeblock by one tab.
    return '\n\t' + lines.join('\n\t') + '\n' // trailing newline is unnecessary but adds some symmetry.
  })

  fs.writeFile(md, readmeTxt, (err) => {
    if (err) {
      throw err
    }

    console.log(util.format('Saved "%s" created from "%s".', md, readme))
  })
})
