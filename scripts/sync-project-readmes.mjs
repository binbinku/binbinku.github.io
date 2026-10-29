import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname, posix } from 'node:path';
import { projects } from '../src/data/site.ts';

const exec = promisify(execFile);
const root = resolve(import.meta.dirname, '..');
const branches = { BKProjectManager: 'master', BKDeviceMonitor: 'master', BKAppSwitch: 'main', BKCleanHelper: 'main', DX11Template: 'master', BKEFTTools: 'master' };
async function api(endpoint) {
  const { stdout } = await exec('gh', ['api', endpoint], { encoding: 'utf8', maxBuffer: 12 * 1024 * 1024 });
  return JSON.parse(stdout);
}
async function snapshot(project) {
  const repo = new URL(project.url).pathname.slice(1);
  const head = await api(`repos/${repo}/commits/${branches[project.name]}`);
  const readme = await api(`repos/${repo}/readme?ref=${head.sha}`);
  const body = Buffer.from(readme.content, 'base64').toString('utf8').replace(/^>[ \t]+$/gm, '>');
  const sourceUrl = `${project.url}/blob/${head.sha}/${readme.path}`;
  const assets = {};
  const sources = new Set([...body.matchAll(/(?:src|srcset)=["']([^"']+)["']|!\[[^\]]*\]\(([^\s)]+)(?:\s+[^)]*)?\)/g)].map(match => match[1] || match[2]));
  await Promise.all([...sources].map(async source => {
    if (/^(?:https?:|data:|#|\/\/)/i.test(source)) return;
    const path = posix.normalize(posix.join(posix.dirname(readme.path), source));
    if (path.startsWith('../')) throw new Error(`${repo}: image leaves repository: ${source}`);
    const file = await api(`repos/${repo}/contents/${path.split('/').map(encodeURIComponent).join('/')}?ref=${head.sha}`);
    const destination = `images/readmes/${project.id}/${path}`;
    await mkdir(dirname(resolve(root, 'public', destination)), { recursive: true });
    await writeFile(resolve(root, 'public', destination), Buffer.from(file.content, 'base64'));
    assets[source] = `/${destination}`;
  }));
  await mkdir(resolve(root, 'src/content/project-readmes'), { recursive: true });
  const frontmatter = `---\nprojectId: ${JSON.stringify(project.id)}\nsourceUrl: ${JSON.stringify(sourceUrl)}\nsyncedAt: ${JSON.stringify(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()))}\n---\n`;
  await writeFile(resolve(root, `src/content/project-readmes/${project.id}.md`), frontmatter + body);
  console.log(`${project.name}: README + ${Object.keys(assets).length} local images`);
  return [project.id, { repositoryUrl: project.url, sourceUrl, readmePath: readme.path, commit: head.sha, assets }];
}
const entries = await Promise.all(projects.map(snapshot));
await writeFile(resolve(root, 'src/data/project-readmes.json'), JSON.stringify(Object.fromEntries(entries), null, 2) + '\n');
