'use strict'

let checkerInterval = null
let lastCount = 0
let goodChecks = 0

const DATA = {
  follow: {
    toggle: false,
    loops: 1,
  },
  party: {
    toggle: false,
    loops: 10,
  },
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // console.log(sender.tab ? 'from a content script:' + sender.tab.url : 'from the extension')
  if (request.type === 'follow') {
    DATA.follow.toggle = !DATA.follow.toggle
    DATA.party.toggle = false
  }

  if (request.type === 'party') {
    DATA.follow.toggle = false
    DATA.party.toggle = !DATA.party.toggle
  }

  sendResponse({ follow: DATA.follow.toggle, party: DATA.party.toggle })
  if (request.type) {
    if (DATA.follow.toggle || DATA.party.toggle) startInterval()
    else clearInterval(checkerInterval)
  }
})

const shuffle = (array) => {
  var currentIndex = array.length
  var temporaryValue, randomIndex
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex--)
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }
  return array
}

// const createCounter = (elem) => {
//   const countElem = elem.closest('span.count')
//   if (countElem.length > 0) {
//     countElem.text(`${i + 1}`)
//   } else {
//     const countElem = $('<span class="count">0</span>')
//     countElem.insertAfter(element)
//   }
// }

const getLoops = () => {
  if (DATA.follow.toggle) return DATA.follow.loops
  if (DATA.party.toggle) return DATA.party.loops
  return 0
}

const searchClass = () => {
  if (DATA.follow.toggle) return $('.modal').find('a[class*="share"] div[class*="party"]').closest('a[class*="share"]')
  if (DATA.party.toggle) return $('.modal').find('a[class*="share"] div[class*="party"]').closest('a[class*="share"]')
  return null
}

const startSharing = (_elems) => {
  let total = 0
  let counter = 0
  const elems = DATA.follow.toggle ? shuffle(_elems) : _elems
  elems.each((index, _element) => {
    const element = $(_element).closest('.card, .tile').find('div[class*="share"]')
    for (let i = 0; i < getLoops(); ++i) {
      setTimeout(() => {
        if (DATA.follow.toggle || DATA.party.toggle) {
          element.css('backgroundColor', 'yellow')
          element.trigger('click')
          setTimeout(() => {
            const share = searchClass()
            if (share.length > 0) {
              share.find(':first-child').trigger('click')
              if (total === ++counter && DATA.party.toggle) {
                startSharing(_elems)
              }
            }
          }, 2500)
        }
      }, 2500 * ++total)
    }
  })
}

const startInterval = () => {
  lastCount = 0
  goodChecks = 0

  const radioToggle = $('input[value*="available"]')
  radioToggle.get(0).click()

  checkerInterval = setInterval(() => {
    const elems = $('a[href*="/listing/"] img')

    if (lastCount === elems.length) ++goodChecks
    else elems.last().get(0).scrollIntoView()

    if (goodChecks === 2) {
      clearInterval(checkerInterval)
      startSharing(elems)
    }
    lastCount = elems.length
  }, 2500)
}
