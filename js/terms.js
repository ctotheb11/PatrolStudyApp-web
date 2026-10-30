// Terms of Use shown on first launch (must be accepted) and from the About screen.
// DRAFT for attorney review. Fill in the bracketed items before release.
// Change TERMS_VERSION whenever the text changes so every user must accept the new version.
(function (root) {
  const TERMS_VERSION = '2026-10-27';

  // Short checklist shown above the full text.
  const SUMMARY = [
    'This app is for <strong>study and general reference only</strong>. It is not legal advice and not a substitute for an attorney, your prosecutor, a court, or your department\'s policies and training.',
    'It may contain errors and may be out of date. <strong>Always verify</strong> against the official statute text, current case law, and your agency before acting.',
    'You use it at your own risk, and <strong>you give up the right to sue</strong> the developer and everyone associated with the app over its use, as stated in Sections 8 to 10.',
    'Disputes go to individual arbitration in Texas, not court or a class action (Section 13).',
    'Do not use the app while driving.',
  ];

  const TEXT = `
<h3>Terms of Use and End User License Agreement</h3>
<p class="muted">Version ${TERMS_VERSION}. DRAFT pending attorney review.</p>

<p>These Terms of Use ("Terms") are a binding agreement between you and [DEVELOPER LEGAL NAME / LLC NAME] ("Developer," "we," "us"). They govern your use of the Texas Statutes Reference application, its content, and any updates (the "App"). <strong>By tapping "I agree" or using the App, you accept these Terms. If you do not agree, do not use the App.</strong></p>

<h4>1. Study and reference purpose only</h4>
<p>The App is an educational study aid and quick-reference summary of selected Texas statutes and court decisions. It is provided for general informational and study purposes only. It is not intended to be, and must not be used as, the sole basis for any arrest, detention, search, seizure, charging decision, use of force, testimony, report, or other official or legal action.</p>

<h4>2. Not legal advice; no attorney-client relationship</h4>
<p><strong>THE APP IS NOT A SUBSTITUTE FOR THE ADVICE OF AN ATTORNEY.</strong> It does not provide legal advice, legal opinions, or legal services, and using it does not create an attorney-client relationship with anyone. Consult your prosecutor, agency legal advisor, or a licensed Texas attorney for advice about a specific situation. (Tex. Gov't Code § 81.101(c).)</p>

<h4>3. Your judgment and your agency's rules control</h4>
<p>You are solely responsible for your decisions and actions. Your agency's policies, general orders, training, and supervisors, and the instructions of your prosecutor and the courts, take priority over anything in the App. Local charging practices vary.</p>

<h4>4. Accuracy, currency, and completeness</h4>
<p>Summaries are simplified and written by the Developer from public sources; some were drafted with the help of software tools. They may contain errors or omissions, may not reflect the most recent legislative changes, effective dates, court decisions, or attorney general opinions, and do not include every offense, element, defense, exception, or enhancement. The official text of the law controls over any summary. Each entry shows the date its statute text was downloaded; the law may have changed since then. Case summaries describe a court's holding in general terms and are not a complete statement of the law; later decisions may limit or overrule them.</p>

<h4>5. No government affiliation or endorsement</h4>
<p>The App is an independent product. It is not affiliated with, endorsed by, or produced by the State of Texas, the Texas Legislature, any court, the Texas Department of Public Safety, TCOLE, any prosecutor's office, or any law enforcement agency. Statute text is from the Texas Legislature's public website; links to court opinions go to official government websites.</p>

<h4>6. Do not use while driving</h4>
<p>Do not read or operate the App while driving or at any time it would distract you from your duties or endanger anyone. Texas law restricts using a wireless device while driving (Tex. Transp. Code § 545.4251) and your agency may have stricter rules.</p>

<h4>7. Eligibility and license</h4>
<p>You must be at least 18 years old to use the App. We grant you a personal, non-exclusive, non-transferable, revocable license to use the App on devices you own or control, for your own study and reference. You may not copy, resell, redistribute, reverse engineer, or create derivative works from the App's compiled summaries, except as the law allows. The underlying statutes and court opinions are public and are not claimed by us.</p>

<h4>8. DISCLAIMER OF WARRANTIES</h4>
<p class="conspicuous">THE APP AND ALL CONTENT ARE PROVIDED "AS IS" AND "AS AVAILABLE," WITH ALL FAULTS AND WITHOUT WARRANTY OF ANY KIND. TO THE FULLEST EXTENT PERMITTED BY LAW, THE DEVELOPER DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF ACCURACY, COMPLETENESS, CURRENCY, MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, NON-INFRINGEMENT, AND ANY WARRANTY ARISING FROM COURSE OF DEALING OR USAGE. WE DO NOT WARRANT THAT THE APP WILL BE ERROR-FREE, UNINTERRUPTED, OR THAT ERRORS WILL BE CORRECTED.</p>

<h4>9. RELEASE, WAIVER OF CLAIMS, AND COVENANT NOT TO SUE</h4>
<p class="conspicuous">TO THE FULLEST EXTENT PERMITTED BY LAW, YOU VOLUNTARILY ASSUME ALL RISK ARISING FROM YOUR USE OF OR RELIANCE ON THE APP. YOU RELEASE, WAIVE, AND FOREVER DISCHARGE THE DEVELOPER AND ITS OWNERS, MEMBERS, MANAGERS, OFFICERS, EMPLOYEES, CONTRACTORS, CONTRIBUTORS, REVIEWERS, LICENSORS, DISTRIBUTORS, SUCCESSORS, AND ASSIGNS (THE "RELEASED PARTIES") FROM ANY AND ALL CLAIMS, DEMANDS, LIABILITIES, DAMAGES, LOSSES, COSTS, AND EXPENSES OF ANY KIND, KNOWN OR UNKNOWN, ARISING OUT OF OR RELATED TO THE APP OR ITS CONTENT, <u>INCLUDING CLAIMS BASED ON THE RELEASED PARTIES' OWN NEGLIGENCE</u>, STRICT LIABILITY, OR ERRORS AND OMISSIONS IN THE CONTENT. YOU AGREE NOT TO SUE OR BRING ANY CIVIL CLAIM, ACTION, OR PROCEEDING AGAINST ANY RELEASED PARTY BASED ON ANY RELEASED CLAIM, AND NOT TO ASSIST OR ENCOURAGE ANYONE ELSE IN DOING SO. THIS INCLUDES CLAIMS ARISING FROM ANY ARREST, DETENTION, SEARCH, CHARGE, PROSECUTION, DISCIPLINE, EMPLOYMENT ACTION, LAWSUIT AGAINST YOU, OR OTHER CONSEQUENCE RELATED TO YOUR USE OF THE APP.</p>
<p>This release does not apply to claims that cannot be waived under applicable law, such as liability for the Released Parties' own gross negligence, fraud, or intentional misconduct where the law does not permit a waiver. Nothing in these Terms limits your right to report a possible crime to law enforcement, to cooperate with any government investigation, or to file a complaint with a government agency; no private agreement can prevent a criminal investigation or prosecution, and these Terms do not attempt to.</p>

<h4>10. LIMITATION OF LIABILITY</h4>
<p class="conspicuous">TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT WILL ANY RELEASED PARTY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR LOST WAGES, LOST EMPLOYMENT, LOSS OF CERTIFICATION, ATTORNEY'S FEES, OR LEGAL DEFENSE COSTS, ARISING OUT OF OR RELATED TO THE APP, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. THE RELEASED PARTIES' TOTAL LIABILITY FOR ALL CLAIMS RELATED TO THE APP WILL NOT EXCEED THE GREATER OF THE AMOUNT YOU PAID FOR THE APP IN THE 12 MONTHS BEFORE THE CLAIM OR TEN U.S. DOLLARS ($10).</p>

<h4>11. Indemnification</h4>
<p>You agree to defend, indemnify, and hold harmless the Released Parties from any claim, demand, loss, or expense (including reasonable attorney's fees) brought by a third party arising out of your use or misuse of the App, your actions or decisions, or your violation of these Terms or of any law.</p>

<h4>12. Third-party links and content</h4>
<p>The App links to government websites and other third-party sources. We do not control them and are not responsible for their content, availability, or changes. A link is not an endorsement.</p>

<h4>13. Arbitration and class action waiver</h4>
<p class="conspicuous">PLEASE READ THIS SECTION CAREFULLY. IT AFFECTS YOUR RIGHTS. Any dispute, claim, or controversy arising out of or relating to the App or these Terms that is not released under Section 9 will be resolved by final and binding arbitration on an individual basis, administered by [ARBITRATION PROVIDER] under its consumer rules, in [COUNTY] County, Texas, or by video conference. YOU AND THE DEVELOPER WAIVE THE RIGHT TO A JURY TRIAL AND THE RIGHT TO PARTICIPATE IN A CLASS, COLLECTIVE, OR REPRESENTATIVE ACTION. Either party may bring an individual claim in small claims court instead, if it qualifies. This agreement is governed by the Federal Arbitration Act. You may opt out of this Section within 30 days after first accepting these Terms by emailing [CONTACT EMAIL] with your name and the statement that you opt out of arbitration.</p>

<h4>14. Privacy</h4>
<p>The App does not require an account and does not collect, transmit, or sell personal information. Saved items and settings are stored only on your device and are deleted when you delete the App. Do not enter case, suspect, victim, or other criminal justice information into the App. See the Privacy Policy at [PRIVACY POLICY URL].</p>

<h4>15. Changes, updates, and termination</h4>
<p>We may update the App, its content, or these Terms at any time. When the Terms change, the App will ask you to accept the new version before you continue. We may suspend or end the App or your license at any time. Sections 4 and 8 through 18 survive termination.</p>

<h4>16. Governing law and venue</h4>
<p>These Terms are governed by the laws of the State of Texas, without regard to conflict-of-law rules, and by applicable federal law. Subject to Section 13, any court proceeding will be brought only in the state or federal courts located in [COUNTY] County, Texas, and you consent to their jurisdiction.</p>

<h4>17. Apple App Store terms</h4>
<p>If you obtained the App from the Apple App Store: (a) these Terms are between you and the Developer only, not Apple Inc. ("Apple"), and the Developer, not Apple, is solely responsible for the App and its content; (b) your license is limited to use on Apple-branded products you own or control, as permitted by the Usage Rules in the Apple Media Services Terms and Conditions; (c) Apple has no obligation to provide maintenance or support for the App; (d) if the App fails to conform to any applicable warranty, you may notify Apple and Apple will refund the purchase price, if any, and to the maximum extent permitted by law Apple has no other warranty obligation; (e) Apple is not responsible for addressing any claims by you or a third party relating to the App, including product liability claims, claims that the App fails to conform to legal or regulatory requirements, and consumer protection claims; (f) Apple is not responsible for the investigation, defense, settlement, or discharge of any third-party claim that the App infringes intellectual property rights; (g) you represent that you are not located in a country subject to a U.S. Government embargo or designated as a "terrorist supporting" country, and are not on any U.S. Government list of prohibited or restricted parties; (h) you must comply with applicable third-party terms (such as your wireless carrier) when using the App; and (i) Apple and its subsidiaries are third-party beneficiaries of these Terms and may enforce them against you.</p>

<h4>18. General</h4>
<p>These Terms, with the Privacy Policy, are the entire agreement between you and the Developer about the App. If any part is found unenforceable, it will be enforced to the maximum extent permitted and the rest will remain in effect. Our failure to enforce a provision is not a waiver. You may not assign these Terms; we may assign them. Headings are for convenience only.</p>

<h4>19. Contact</h4>
<p>[DEVELOPER LEGAL NAME / LLC NAME], [MAILING ADDRESS], [CONTACT EMAIL].</p>
`;

  const api = { TERMS_VERSION, SUMMARY, TEXT };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AppTerms = api;
})(typeof window !== 'undefined' ? window : globalThis);
