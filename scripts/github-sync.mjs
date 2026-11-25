import { appendFile } from 'node:fs/promises';
import { json } from './lib/io.mjs';
const repo=process.env.GITHUB_REPOSITORY;const token=process.env.GITHUB_TOKEN;
if(!repo||!token)throw new Error('需要仓库环境与 GitHub Token');
async function api(path,method='GET',body){const r=await fetch(`https://api.github.com/repos/${repo}/${path}`,{method,headers:{Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','Content-Type':'application/json','X-GitHub-Api-Version':'2022-11-28'},...(body?{body:JSON.stringify(body)}:{})});if(!r.ok)throw new Error(`GitHub API ${r.status}`);return r.status===204?null:r.json();}
const action=process.argv[2];
if(action==='begin'){
 const pulls=await api('pulls?state=open&per_page=100');const busy=pulls.some(p=>p.head.ref.startsWith('automation/'));
 if(process.env.GITHUB_OUTPUT)await appendFile(process.env.GITHUB_OUTPUT,`busy=${busy}\n`);console.log(busy?'已有审核批次，本次只检测并更新待办。':'可创建新的审核批次。');
}else if(action==='report'||action==='pr'){
 const report=await json('.upstream/report.json');
 const body=`官方来源检查：${report.checkedAt}\n\n提交：${report.commit}\n\n受影响页面：${report.affected.join('、')||'无'}\n\n候选稿：${report.generated.map(x=>x.id).join('、')||'无'}\n\n待处理：${report.queue.join('、')||'无'}\n\n${report.skipped.map(x=>`- ${x.id}: ${x.reason}`).join('\n')}\n\n官方索引变化：${report.changes.length}。完整报告见工作流 artifact。`;
 if(action==='pr'){
  const pulls=await api(`pulls?state=open&head=${repo.split('/')[0]}:automation/upstream`);if(pulls.length)throw new Error('已有 PR，拒绝覆盖');
  const pr=await api('pulls','POST',{title:'docs: 核对 HyperFrames 官方内容变化',head:'automation/upstream',base:'main',draft:true,body:body+'\n\n审核步骤：查看差异和候选报告，修正内容；对核对完成的页面运行 node scripts/review-content.mjs <contentId>，提交记录后合并。机器人不会自动合并。'});
  console.log(pr.html_url);
 }else{
  const issues=await api('issues?state=open&per_page=100');const existing=issues.find(x=>!x.pull_request&&x.title==='官方内容同步待办');
  if(existing)await api(`issues/${existing.number}`,'PATCH',{body});else await api('issues','POST',{title:'官方内容同步待办',body});
  console.log('已更新来源同步待办。');
 }
}else if(action==='links'){
 const report=await json('artifacts/external-links.json');const failed=report.results.filter(x=>!x.ok);if(failed.length){const issues=await api('issues?state=open&per_page=100');const current=issues.find(x=>!x.pull_request&&x.title==='外部链接检查待办');const body=`检查时间：${report.date}\n\n${failed.map(x=>`- ${x.status}: ${x.url}${x.transient?'（网络或访问限制，需人工核实）':''}`).join('\n')}`;if(current)await api(`issues/${current.number}`,'PATCH',{body});else await api('issues','POST',{title:'外部链接检查待办',body});}
}else if(action==='failure'){
 const issues=await api('issues?state=open&per_page=100');const current=issues.find(x=>!x.pull_request&&x.title==='官方来源检查失败');const body=`最近尝试失败。上次成功状态不应被刷新。查看运行：https://github.com/${repo}/actions/runs/${process.env.GITHUB_RUN_ID}`;if(current)await api(`issues/${current.number}`,'PATCH',{body});else await api('issues','POST',{title:'官方来源检查失败',body});
}else throw new Error('未知操作');
