import puppeteer from 'puppeteer'
import { mkdir } from 'fs/promises'

const BASE_URL = 'http://localhost:5173'
const OUT_DIR = './docs/screenshots'

const MOCK_PROFILE = {
  id: 'demo-harvey-001',
  input: { type: 'name', name: 'Harvey Specter', jurisdiction: 'New York', firmName: 'Pearson Specter Litt' },
  subjectName: 'Harvey Specter',
  subjectJurisdiction: 'New York',
  createdAt: '2026-04-05T09:00:00.000Z',
  updatedAt: '2026-04-05T09:22:00.000Z',
  searchLog: [],
  sections: {
    executiveSummary: { status: 'complete', confidence: 'high', notes: '', sources: [{ url: 'https://www.martindale.com/harvey-specter', title: 'Martindale-Hubbell - Harvey Specter' }, { url: 'https://www.nylj.com/top-litigators-2025', title: 'NY Law Journal - Top Litigators 2025' }], content: '## Overview\n\nHarvey Specter is a senior named partner at Pearson Specter Litt and widely regarded as the best closer in New York City. His reputation is built on a 97% win rate across two decades of high-stakes corporate litigation, a zero-tolerance policy for losing, and a refusal to settle when he believes he can win at trial.\n\nSpecter is known for operating outside conventional legal frameworks when the rules allow it, leveraging personal relationships with judges, opposing counsel, and Manhattan power brokers to gain advantages before a case is ever filed.\n\nAnyone facing Specter across a table or in a courtroom should understand one thing: he will have done more preparation than you, he will know more about you than you expect, and he will make you feel like you are winning right up until you are not.' },
    professionalBackground: { status: 'complete', confidence: 'high', notes: 'Verify his Harvard record — rumors of irregularities have circulated for years.', sources: [{ url: 'https://law.harvard.edu/alumni/specter-harvey', title: 'Harvard Law School Alumni Directory' }], content: '## Education\n\nHarvey Specter graduated from Harvard Law School. Circumstances surrounding his admission have been the subject of informal speculation in New York legal circles for years.\n\n## Career History\n\n- 2003-2006: ADA, Manhattan District Attorney\'s Office\n- 2006-2011: Associate, Pearson Hardman\n- 2011-2014: Junior Partner, Pearson Hardman\n- 2014-2018: Senior Partner, Pearson Specter\n- 2018-present: Named Partner, Pearson Specter Litt\n\n## Notable Cases\n\nDefended Coastal Motors against a $2.4B class action in 18 days. Reversed a guilty verdict for a Fortune 500 CEO mid-appeal. Won a patent dispute in arbitration described as "a case that should not have been winnable."' },
    behavioralStyle: { status: 'complete', confidence: 'high', notes: '', sources: [{ url: 'https://www.abajournal.com/specter-profile-2024', title: 'ABA Journal Profile - Harvey Specter' }], content: '## Negotiation Approach\n\nSpecter constructs situations where the other side believes they have leverage, then removes it at the moment it causes the most psychological damage. Early meetings feel collaborative. Then, at the moment the other side has made internal commitments, he pivots and the terms change entirely.\n\n## Courtroom Demeanor\n\nControlled, confident, and theatrical when needed. Reads juries faster than almost anyone in the New York bar.\n\n## Conflict Style\n\nDominance-oriented but strategically patient. Carries grudges professionally.\n\n## Decision-Making\n\nFast and intuitive. Associates report he routinely knows the outcome of a negotiation before it starts.' },
    communicationProfile: { status: 'complete', confidence: 'high', notes: '', sources: [{ url: 'https://twitter.com/harveyspecternyc', title: 'Twitter/X - @harveyspecternyc' }], content: '## Writing Style\n\nBrief, precise, structured for impact. Leads with the sharpest available argument. Anticipates and pre-empts counterarguments.\n\n## Tone\n\nFormal in filings, disarmingly casual in correspondence. Uses first names immediately as a deliberate psychological move.\n\n## Social Media\n\n@harveyspecternyc. 312,000 followers. Follows no one. Posts 2-3 times per month. Once responded to a verdict criticism: "Check the public record."' },
    politicalProfile: { status: 'complete', confidence: 'medium', notes: '', sources: [{ url: 'https://www.fec.gov', title: 'FEC Donor Database' }], content: '## Political Donations\n\n$63,000 in FEC contributions since 2008 split across both parties. Pattern consistent with relationship maintenance, not ideology.\n\n## Judicial Relationships\n\nPersonal relationships with at least three sitting Manhattan federal judges from his DA years. Documented in denied recusal motions (2019, 2022).' },
    socialMediaPresence: { status: 'complete', confidence: 'medium', notes: '', sources: [{ url: 'https://twitter.com/harveyspecternyc', title: '@harveyspecternyc' }], content: '## Twitter/X\n\n312,000 followers. Follows 0. Posts infrequently. Never posts photos.\n\n## LinkedIn\n\n14,200 connections. Recommendations from three Fortune 500 GCs, two former judges, one senator.\n\n## Facebook\n\nNo profile found. Absence almost certainly intentional.\n\n## Overall\n\nSmall footprint by design. Every public statement is curated.' },
    professionalReputation: { status: 'complete', confidence: 'high', notes: '', sources: [{ url: 'https://www.chambers.com/specter-harvey', title: 'Chambers USA' }], content: '## Bar Standing\n\nAdmitted NY State Bar, SDNY, EDNY, Second Circuit, U.S. Supreme Court. In good standing.\n\n## Ratings\n\nAvvo 10/10. Martindale-Hubbell AV Preeminent. Chambers USA Band 1 Corporate Litigation (NY) nine consecutive years.\n\n## Awards\n\n- NY Law Journal Litigator of the Year (2019, 2022, 2024)\n- National Trial Lawyers Top 100 (2017-2025)\n- Harvard Alumni Achievement Award (declined, 2023)' },
    redFlags: { status: 'complete', confidence: 'medium', notes: 'The DA departure is worth pressing if character becomes relevant.', sources: [{ url: 'https://www.courtlistener.com', title: 'CourtListener - Recusal Motion 2022' }], content: '## Disciplinary History\n\nOne informal bar complaint (2018) for alleged witness contact. Dismissed after investigation.\n\n## DA Office Departure\n\nLeft the Manhattan DA in 2006 under unexplained circumstances. Internal inquiry into evidence handling. No charges filed, record sealed.\n\n## Ethical Concerns\n\nOperates aggressively at the edges of the Model Rules. Never found to have crossed a line, but the edges are documented in opposing motions across a dozen cases.' },
    strategicRecommendations: { status: 'complete', confidence: 'high', notes: 'Never give him a reason to make it personal. He wins personal.', sources: [], content: '## Communication Strategy\n\nDo not try to match his charisma. Be formal, precise, give him nothing to calibrate your position. Put everything in writing.\n\n## Negotiation Approach\n\nIdentify your walk-away position before entering any room and do not let him move it. Assume you are being managed at all times.\n\n## Leverage Points\n\n- DA office departure is sealed but not forgotten\n- He does not handle unpredictability well\n- Threats to major client relationships get his full attention\n\n## Things to Avoid\n\n- Underestimating his preparation\n- Treating warmth as a signal of intent\n- Escalating publicly\n- Giving him time\n\n## Overall Assessment\n\nThe attorney who prepares thoroughly, stays formal, creates unpredictability, and refuses to be charmed will find a more beatable opponent than his reputation suggests. The attorney who walks in impressed will walk out having lost.' }
  }
}

await mkdir(OUT_DIR, { recursive: true })

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })

// Inject mock data and load dossier
await page.goto(BASE_URL, { waitUntil: 'networkidle0' })
await page.evaluate((profile) => {
  localStorage.setItem('ocp_profiles_v1', JSON.stringify({
    state: { profiles: [profile], activeProfileId: profile.id },
    version: 0
  }))
}, MOCK_PROFILE)
await page.reload({ waitUntil: 'networkidle0' })
await new Promise(r => setTimeout(r, 800))

// Screenshot 1: Dossier overview (top)
await page.screenshot({ path: `${OUT_DIR}/dossier-overview.png` })
console.log('Saved: dossier-overview.png')

// Screenshot 2: Behavioral Style section
await page.evaluate(() => document.getElementById('section-behavioralStyle').scrollIntoView())
await new Promise(r => setTimeout(r, 300))
await page.screenshot({ path: `${OUT_DIR}/dossier-behavioral.png` })
console.log('Saved: dossier-behavioral.png')

// Screenshot 3: Red Flags section
await page.evaluate(() => document.getElementById('section-redFlags').scrollIntoView())
await new Promise(r => setTimeout(r, 300))
await page.screenshot({ path: `${OUT_DIR}/dossier-red-flags.png` })
console.log('Saved: dossier-red-flags.png')

// Screenshot 4: Strategic Recommendations
await page.evaluate(() => document.getElementById('section-strategicRecommendations').scrollIntoView())
await new Promise(r => setTimeout(r, 300))
await page.screenshot({ path: `${OUT_DIR}/dossier-strategy.png` })
console.log('Saved: dossier-strategy.png')

// Screenshot 5: Search form (new search)
await page.evaluate(() => {
  localStorage.setItem('ocp_profiles_v1', JSON.stringify({
    state: { profiles: [], activeProfileId: null },
    version: 0
  }))
})
await page.reload({ waitUntil: 'networkidle0' })
await new Promise(r => setTimeout(r, 500))
await page.screenshot({ path: `${OUT_DIR}/search-form.png` })
console.log('Saved: search-form.png')

// Screenshot 6: Search form with data filled in
await page.type('input[placeholder="e.g. Jonathan R. Smith"]', 'Harvey Specter')
await page.select('select', 'New York')
await page.type('input[placeholder="e.g. Smith & Associates LLP"]', 'Pearson Specter Litt')
await new Promise(r => setTimeout(r, 200))
await page.screenshot({ path: `${OUT_DIR}/search-form-filled.png` })
console.log('Saved: search-form-filled.png')

await browser.close()
console.log('Done.')
