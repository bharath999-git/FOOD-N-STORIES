/* script.js — client-side UI, localStorage-backed demo */
if(f){
// read as data URL so it persists in localStorage demo
media = await readFileAsDataURL(f);
mediaType = f.type.startsWith('image/')? 'image' : f.type.startsWith('video/')? 'video' : null;
}


const newPost = { id: buildId(), title, region, category, content, media, mediaType, ts: Date.now() };
posts.push(newPost);
savePosts();
postForm.reset();
mediaPreview.innerHTML = '';
renderPosts();
});


function readFileAsDataURL(file){
return new Promise((res,rej)=>{
const r = new FileReader();
r.onload = ()=>res(r.result);
r.onerror = rej;
r.readAsDataURL(file);
});
}


function viewPost(id){
const p = posts.find(x=>x.id===id); if(!p) return;
postModal.setAttribute('aria-hidden','false');
postModal.style.display = 'flex';
modalTitle.textContent = p.title;
modalMeta.textContent = `Region: ${p.region} • Category: ${p.category} • ${humanDate(p.ts)}`;
modalBody.innerHTML = p.content ? p.content.replace(/\n/g,'<br>') : '<em>No additional text</em>';
modalMedia.innerHTML = '';
if(p.mediaType === 'image'){
modalMedia.innerHTML = `<img src="${p.media}" alt="${p.title}">`;
} else if(p.mediaType === 'video'){
modalMedia.innerHTML = `<video src="${p.media}" controls></video>`;
} else {
modalMedia.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--muted)">No media</div>`;
}
}


closeModal.addEventListener('click', ()=>{ postModal.setAttribute('aria-hidden','true'); postModal.style.display='none'; });
window.viewPost = viewPost; // expose to card markup


function deletePost(id){
if(!confirm('Delete this post?')) return;
posts = posts.filter(p=>p.id!==id); savePosts(); renderPosts();
}


regionSelect.addEventListener('change', ()=>{ currentFilter.region = regionSelect.value; renderPosts(); });


categoryTags.addEventListener('click', e=>{
if(e.target.matches('.tag')){
[...categoryTags.querySelectorAll('.tag')].forEach(t=>t.classList.remove('active'));
e.target.classList.add('active');
currentFilter.category = e.target.dataset.cat;
renderPosts();
}
});


searchInput.addEventListener('input', ()=>{ currentFilter.q = searchInput.value.trim(); renderPosts(); });


// initial demo content if none
if(posts.length === 0){
posts.push({ id: buildId(), title: 'Coconut Chutney — Kerala style', region: 'india', category: 'recipe', content: 'Fresh coconut, green chillies, curry leaves and roasted chana dal. Blend and temper with mustard and curry leaf.', media: null, mediaType: null, ts: Date.now()-1000000 });
posts.push({ id: buildId(), title: 'Street Pizza in Naples', region: 'italy', category: 'memory', content: 'A small wood-fired slice near the station — thin crust and smoky cheese.', media: null, mediaType: null, ts: Date.now()-2000000 });
savePosts();
}


renderPosts();