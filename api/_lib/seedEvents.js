// Curated, always-on fallback list of upcoming tech recruiting events.
// Dates are computed relative to "today" so the Deadlines tab is never empty.
// Replace / extend this list as real events are confirmed.

function daysFromNow(n, hour = 18) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}

export function getSeedEvents() {
  return [
    {
      id: 'seed-google-step-info',
      kind: 'event',
      title: 'Google STEP & Engineering Residency Info Session',
      organizer: 'Google',
      company: 'Google',
      date: daysFromNow(2, 17),
      deadline: daysFromNow(1, 23),
      format: 'Virtual',
      location: 'Online',
      url: 'https://buildyourfuture.withgoogle.com/programs/step',
      tags: ['New Grad', 'Virtual', 'SWE']
    },
    {
      id: 'seed-meta-university',
      kind: 'event',
      title: 'Meta University for Engineers Recruiting Q&A',
      organizer: 'Meta',
      company: 'Meta',
      date: daysFromNow(4, 18),
      deadline: daysFromNow(3, 23),
      format: 'Virtual',
      location: 'Online',
      url: 'https://www.metacareers.com/careerprograms/pathways/metauniversityengineering/',
      tags: ['New Grad', 'Virtual', 'SWE']
    },
    {
      id: 'seed-jane-street-women',
      kind: 'event',
      title: 'Jane Street Women in Tech Recruiting Event',
      organizer: 'Jane Street',
      company: 'Jane Street',
      date: daysFromNow(6, 18),
      deadline: daysFromNow(5, 23),
      format: 'Hybrid',
      location: 'NYC + Online',
      url: 'https://www.janestreet.com/join-jane-street/programs-and-events/',
      tags: ['New Grad', 'SWE', 'Quant']
    },
    {
      id: 'seed-citadel-campus',
      kind: 'event',
      title: 'Citadel Campus Connect: Software Engineering',
      organizer: 'Citadel',
      company: 'Citadel',
      date: daysFromNow(8, 18),
      deadline: daysFromNow(7, 23),
      format: 'Virtual',
      location: 'Online',
      url: 'https://www.citadel.com/careers/students/',
      tags: ['New Grad', 'Virtual', 'SWE', 'Quant']
    },
    {
      id: 'seed-stripe-grace-hopper',
      kind: 'event',
      title: 'Stripe Engineering Coffee Chat',
      organizer: 'Stripe',
      company: 'Stripe',
      date: daysFromNow(3, 17),
      deadline: daysFromNow(2, 23),
      format: 'Virtual',
      location: 'Online',
      url: 'https://stripe.com/jobs/university',
      tags: ['New Grad', 'Virtual', 'SWE']
    },
    {
      id: 'seed-databricks-info',
      kind: 'event',
      title: 'Databricks New Grad Engineering Info Session',
      organizer: 'Databricks',
      company: 'Databricks',
      date: daysFromNow(10, 17),
      deadline: daysFromNow(9, 23),
      format: 'Virtual',
      location: 'Online',
      url: 'https://www.databricks.com/company/careers/university-recruiting',
      tags: ['New Grad', 'Virtual', 'Data', 'SWE']
    },
    {
      id: 'seed-anthropic-research',
      kind: 'event',
      title: 'Anthropic ML Research Careers Q&A',
      organizer: 'Anthropic',
      company: 'Anthropic',
      date: daysFromNow(5, 18),
      deadline: daysFromNow(4, 23),
      format: 'Virtual',
      location: 'Online',
      url: 'https://www.anthropic.com/careers',
      tags: ['ML', 'Research', 'Virtual']
    },
    {
      id: 'seed-openai-residency',
      kind: 'event',
      title: 'OpenAI Residency Info Session',
      organizer: 'OpenAI',
      company: 'OpenAI',
      date: daysFromNow(12, 17),
      deadline: daysFromNow(11, 23),
      format: 'Virtual',
      location: 'Online',
      url: 'https://openai.com/careers/residency',
      tags: ['ML', 'Research', 'Virtual']
    },
    {
      id: 'seed-nvidia-grad',
      kind: 'event',
      title: 'NVIDIA New Grad Recruiting Mixer',
      organizer: 'NVIDIA',
      company: 'NVIDIA',
      date: daysFromNow(7, 18),
      deadline: daysFromNow(6, 23),
      format: 'Hybrid',
      location: 'Santa Clara + Online',
      url: 'https://www.nvidia.com/en-us/about-nvidia/careers/university-recruiting/',
      tags: ['New Grad', 'ML', 'Hardware']
    },
    {
      id: 'seed-figma-config-recruit',
      kind: 'event',
      title: 'Figma Engineering Open House',
      organizer: 'Figma',
      company: 'Figma',
      date: daysFromNow(14, 17),
      deadline: daysFromNow(13, 23),
      format: 'Virtual',
      location: 'Online',
      url: 'https://www.figma.com/careers/',
      tags: ['New Grad', 'Frontend', 'Virtual']
    },
    {
      id: 'seed-vercel-devrel',
      kind: 'event',
      title: 'Vercel DevRel & Frontend Careers Chat',
      organizer: 'Vercel',
      company: 'Vercel',
      date: daysFromNow(9, 17),
      deadline: daysFromNow(8, 23),
      format: 'Virtual',
      location: 'Online',
      url: 'https://vercel.com/careers',
      tags: ['DevRel', 'Frontend', 'Virtual']
    },
    {
      id: 'seed-palantir-deployment',
      kind: 'event',
      title: 'Palantir Forward Deployed Engineer Info',
      organizer: 'Palantir',
      company: 'Palantir',
      date: daysFromNow(11, 18),
      deadline: daysFromNow(10, 23),
      format: 'Virtual',
      location: 'Online',
      url: 'https://www.palantir.com/careers/students-and-grads/',
      tags: ['New Grad', 'SWE', 'Virtual']
    },
    {
      id: 'seed-snowflake-grad',
      kind: 'event',
      title: 'Snowflake New Grad Engineering Recruit',
      organizer: 'Snowflake',
      company: 'Snowflake',
      date: daysFromNow(13, 17),
      deadline: daysFromNow(12, 23),
      format: 'Virtual',
      location: 'Online',
      url: 'https://careers.snowflake.com/us/en/university',
      tags: ['New Grad', 'Data', 'Virtual']
    },
    {
      id: 'seed-cloudflare-grad',
      kind: 'event',
      title: 'Cloudflare Engineering Open House',
      organizer: 'Cloudflare',
      company: 'Cloudflare',
      date: daysFromNow(15, 18),
      deadline: daysFromNow(14, 23),
      format: 'Virtual',
      location: 'Online',
      url: 'https://www.cloudflare.com/careers/early-talent/',
      tags: ['New Grad', 'SWE', 'Virtual']
    },
    {
      id: 'seed-amazon-internfair',
      kind: 'event',
      title: 'Amazon Student Programs Career Fair',
      organizer: 'Amazon',
      company: 'Amazon',
      date: daysFromNow(6, 16),
      deadline: daysFromNow(5, 23),
      format: 'Virtual',
      location: 'Online',
      url: 'https://www.amazon.jobs/en/teams/student-programs',
      tags: ['New Grad', 'SWE', 'Virtual']
    }
  ]
}
