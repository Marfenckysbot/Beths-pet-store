/* Lightweight, accessible search suggestions for Beth's Pet Store */
document.addEventListener("DOMContentLoaded",()=>{
  const fields=document.querySelectorAll('.header-search input[type="search"][name="q"]');
  if(!fields.length)return;
  let list=document.getElementById("marketplace-search-suggestions");
  if(!list){list=document.createElement("datalist");list.id="marketplace-search-suggestions";document.body.append(list);}
  const suggestions=[
    "Premium Everyday Dog Food","Cloud-Soft Round Pet Bed","Classic Red Comfort Collar","Starter Aquarium Set",
    "Dog food","Cat food","Bird seed","Fish food","Pet beds","Collars and leads","Pet toys","Aquariums",
    "Grooming and care","Pet accessories","Food and treats","Habitats and aquatics"
  ];
  list.replaceChildren(...suggestions.map(value=>{const option=document.createElement("option");option.value=value;return option;}));
  fields.forEach(field=>{
    field.setAttribute("list",list.id);
    field.setAttribute("autocomplete","off");
    field.setAttribute("aria-describedby","marketplace-search-hint");
    let hint=document.getElementById("marketplace-search-hint");
    if(!hint){hint=document.createElement("span");hint.id="marketplace-search-hint";hint.className="sr-only";hint.textContent="Search the preview catalogue by product name or category. Suggestions appear as you type.";document.body.append(hint);}
  });
});
