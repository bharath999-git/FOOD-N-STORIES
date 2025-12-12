const postsGrid = document.getElementById("postsGrid");
`<img src="${url}">` :
`<video src="${url}" controls></video>`;
};


/* SUBMIT */
postForm.onsubmit=async(e)=>{
e.preventDefault();


const file = mediaInput.files[0];
let media=null, type=null;


if(file){
media = await toBase64(file);
type = file.type.startsWith("image")?"image":"video";
}


posts.push({
id:id(),
title:postTitle.value.trim(),
region:postRegion.value,
content:postContent.value.trim(),
media:media,
mediaType:type,
time:Date.now()
});


save(); postForm.reset(); mediaPreview.innerHTML=""; render();
};


function toBase64(file){
return new Promise((resolve)=>{
const r=new FileReader();
r.onload=()=>resolve(r.result);
r.readAsDataURL(file);
});
}


/* VIEW POST */
function view(pid){
const p = posts.find(x=>x.id===pid);
if(!p) return;


modalTitle.textContent = p.title;
modalMeta.textContent = p.region;
modalBody.textContent = p.content;


modalMedia.innerHTML = p.mediaType==='image'
? `<img src="${p.media}">`
: p.mediaType==='video'
? `<video src="${p.media}" controls></video>`
: "<p>No media</p>";


postModal.setAttribute("aria-hidden","false");
}


closeModal.onclick=()=>postModal.setAttribute("aria-hidden","true");


regionSelect.onchange=()=>{ filter.region=regionSelect.value; render(); }
searchInput.oninput=()=>{ filter.search=searchInput.value.trim(); render(); }


render();