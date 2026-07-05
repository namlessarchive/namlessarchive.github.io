// =========================================
// TERMINAL STATE
// =========================================

let capsMode = false
let filesMode = false

// =========================================
// DELAY FUNCTION
// =========================================

const wait = (ms = 0) =>
  new Promise(resolve => setTimeout(resolve, ms))


// =========================================
// TYPEWRITER EFFECT
// =========================================

function writeText(target, content, delay = 5)
{
  return new Promise((resolve) => {

    const contentArray = content.split('')
    let current = 0

    while (current < contentArray.length) {

      ;((curr) => {

        setTimeout(() => {

          target.innerHTML += contentArray[curr]

          window.scrollTo(0, document.body.scrollHeight)

          if (curr === contentArray.length - 1) {
            resolve()
          }

        }, delay * curr)

      })(current++)

    }

  })
}


// =========================================
// COMMAND EXECUTION - WHAT ARE YOU DOING POKING AROUND HERE AGENT? YOU'LL SPOIL THE SURPRISES.
// =========================================

function execute(command, output, asciiText)
{
  const cmd = command.toLowerCase()

  // CAPSLOCK TRIGGER
  if (cmd.includes('capslock')) {

    capsMode = true

    return "INPROPER TERMINAL USE DETECTED.\nUSE term.fix TO RESTORE ACCESS.\nLOCKDOWN ENABLED"
  }

  if (cmd === 'files') {

  capsMode = false
  filesMode = true

  return "Archive mode enabled. Use return to exit or help for info."
  }


  // LOCKDOWN MODE
  if (capsMode) {

    switch(cmd) {

      case 'term.fix':
        capsMode = false
        return "TERMINAL RESTORED."

      case 'test':
        return "LOCKDOWN ACTIVE - ACCESS RESTRICTED"

      case 'help':
        return "HELP MENU IS NOT AVAILABLE FOR LOCKDOWN MODE"

      case 'hello':
        return "WELCOME TO LOCKDOWN MODE"

      case 'king':
        return "HAVE YOU SEEN THE SIGN? SIGN.Y/SIGN.N"

      case 'sign.y':
        return "AGENT, PLEASE REPORT THIS E-CODE TO YOUR SUPERVISOR OR CONTACT: 0106T."
      case 'sign.n':
        return "IGNORE ALL PREVIOUS MENTIONS."

      case 'door':
        return "Are you sure you want to enter? DOOR.Y/DOOR.N"

      case 'door.n':
        return "A wise choice."

      case 'door.y':
        window.open('door', '_blank')  
        return "The door is open."

      default:
        return "COMMAND ACCESS DENIED"
    }
  }

if (filesMode) {

    switch(cmd) {
      case 'help':
        return "help - shows commands for archive mode\ntest - opens the test file\nreturn - exits archive mode\n\nTo search for files, simply type the name as a command.\n-Popular File Commands-\ndemonweb\ntest\ncarunpc"


      case 'return':
        filesMode = false
        return "Exited archive mode."

      case 'test':
        return "File Located\nTEST.TXT - CONTENTS BELOW\n[This is a test file for users to verify the working order of the terminal.]"

      case 'passcode':
        return "Passcode file not found. Are you trying to get to the bookshop? Perhaps you should take care of your case first, agent."

      case 'demonweb':
        window.open('https://demonweb101.com', '_blank')
        return "File Located\nOpening demonweb101.com"

      case 'carunpc':
        window.open('carunpc', '_blank')
        return "File Located\nOpening Roger Carun's PC"


      default:
        return "ERROR: Could not find file under that name."

    }
  }


  // NORMAL MODE
  switch(cmd) {

    case '':
      return "\n"

    case 'clear':
      asciiText.style.display = 'none'
      output.innerHTML = ''
      return ""

    case 'test':
      return "Validating...\nTest Complete.\nTerminal in working order."

    case 'onboard':
      window.open('onboard.html', '_blank')
      return "Opening onboarding file..."
      
    case 'intro':
      window.open('intro.html', '_blank')
      return "Playing intro..."
    
    case 'king':
      return"This command can only be used in LOCKDOWN mode."

    case 'hint':
      return"A portal, often made of wood."

    case 'door':
      return"ERROR: This command can only be used in LOCKDOWN MODE."

    case 'passcode':
      return"ERROR: Unknown command, try archive mode?"

    case 'lockdown':
      return"Not that simple. What happens when you [MODIFY] your keys?"
    
    case 'help':
      return "help - show commands\nclear - clear screen\ntest - system test\nonboard - open onboarding\nintro - plays current intro sequence\nfiles - enables archive mode, use to nagivate.\nhint - ???"


    default:
      return "Unknown command"
  }
}


// =========================================
// KEYBOARD HANDLER
// =========================================

function handleKeypress(e, input, output, asciiText)
{
  function noInputHasFocus()
  {
    const elements = ['INPUT', 'TEXTAREA', 'BUTTON']
    return elements.indexOf(document.activeElement.tagName) === -1
  }

  if (!noInputHasFocus()) return


  // -------------------------------------
  // SPECIAL KEYS (MODIFIERS)
  // -------------------------------------

  const specialKeys = ['CapsLock', 'Shift', 'Control', 'Alt']

  if (specialKeys.includes(e.key)) {
    input.insertAdjacentText(
      'beforeend',
      `[${e.key.toUpperCase()}]`
    )
    return
  }


  // -------------------------------------
  // ENTER
  // -------------------------------------

  if (e.key === 'Enter') {

    const command = input.innerText

    input.innerHTML = ''

    output.innerHTML += "<br><strong>" + command + "</strong><br>"
 // If result contains an image tag, inject directly
    writeText(output, execute(command, output, asciiText))
   
  }


  // -------------------------------------
  // BACKSPACE
  // -------------------------------------

  else if (e.key === 'Backspace') {

    input.innerHTML =
      input.innerHTML.slice(0, -1)
  }


  // -------------------------------------
  // NORMAL KEYS
  // -------------------------------------

  else if (e.key.length === 1) {

    input.insertAdjacentText('beforeend', e.key)
  }
}


// =========================================
// PAGE LOAD
// =========================================

document.addEventListener('DOMContentLoaded', async () => {

  const asciiText = document.getElementById('asciiText')
  const asciiArt = asciiText.innerText
  asciiText.innerHTML = ''

  const instructions = document.getElementById('instructions')
  const prompt = document.getElementById('prompt')
  const cursor = document.getElementById('cursor')

  const input = document.getElementById('command-input')
  const output = document.getElementById('output')

  await wait(1000)
  await writeText(asciiText, asciiArt)

  await wait(500)

  await writeText(
    instructions,
    "Enter a command. Type 'help' for a list of commands."
  )

  prompt.prepend('>')
  cursor.innerHTML = '_'

  document.addEventListener(
    'keydown',
    (e) => handleKeypress(e, input, output, asciiText)
  )
})