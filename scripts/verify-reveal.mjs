import sharp from 'sharp'

// Compare settled artwork at one scroll position. A changing transform alone
// cannot prove that the soil is actually concealing anything in the viewport.
export async function visibleSoilCoverage(page) {
  const text = await page.addStyleTag({ content: '* { color: transparent !important; text-shadow: none !important; caret-color: transparent !important; }' })
  const cover = page.locator('.root-curtain')
  const previous = await cover.evaluate(element => element.style.visibility)
  try {
    const visible = await sharp(await page.screenshot()).removeAlpha().raw().toBuffer({ resolveWithObject: true })
    await cover.evaluate(element => { element.style.visibility = 'hidden' })
    const uncovered = await sharp(await page.screenshot()).removeAlpha().raw().toBuffer()
    let changed = 0
    for (let offset = 0; offset < visible.data.length; offset += 3) {
      // Exclude tiny compositor rounding differences between the two captures.
      if ([0, 1, 2].some(channel => Math.abs(visible.data[offset + channel] - uncovered[offset + channel]) >= 5)) changed++
    }
    return Number((changed / (visible.info.width * visible.info.height) * 100).toFixed(4))
  } finally {
    await cover.evaluate((element, value) => { element.style.visibility = value }, previous)
    await text.evaluate(element => element.remove())
  }
}

export async function rootsAreUncovered(page) {
  return page.locator('.root-curtain').evaluate(element => {
    const cover = element.getBoundingClientRect(), window = element.parentElement.getBoundingClientRect()
    return cover.bottom <= window.top + 1 || getComputedStyle(element).opacity === '0'
  })
}
