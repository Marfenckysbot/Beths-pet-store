/* Accessible native suggestions for Beth's Pet Store marketplace search. */
document.addEventListener("DOMContentLoaded",()=>{
  const fields=document.querySelectorAll('.header-search input[type="search"][name="q"]');
  if(!fields.length)return;
  let list=document.getElementById("marketplace-search-suggestions");
  if(!list){list=document.createElement("datalist");list.id="marketplace-search-suggestions";document.body.append(list);}
  const suggestions=[
    "Premium Everyday Dog Food","Gentle Daily Cat Nutrition","Colourful Parrot Seed Blend",
    "Meadow Hay & Small Pet Forage","Cloud-Soft Round Pet Bed","Classic Red Comfort Collar",
    "Starter Aquarium Set","Dog food and treats","Cat food and kitten supplies","Bird seed and parrot feed",
    "Rabbit hay and small pet care","Pet beds and blankets","Collars leads and toys",
    "Fish tanks and aquarium supplies","Grooming and hygiene","Accessories and toys",
    "Food and treats","Habitats and aquatics","Small pet care"
  ];
  list.replaceChildren(...suggestions.map(value=>{
    const option=document.createElement("option");option.value=value;return option;
  }));
  let hint=document.getElementById("marketplace-search-hint");
  if(!hint){
    hint=document.createElement("span");hint.id="marketplace-search-hint";
    hint.className="sr-only";
    hint.textContent="Search product names, animal types, categories and pet-care keywords. Suggestions are available as you type.";
    document.body.append(hint);
  }
  fields.forEach(field=>{
    field.setAttribute("list",list.id);
    field.setAttribute("autocomplete","off");
    field.setAttribute("aria-describedby","marketplace-search-hint");
  });
});
