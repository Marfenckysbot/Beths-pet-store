import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const config = window.BETHS_SUPABASE_CONFIG || {};
const configured = Boolean(config.url && config.anonKey);
const $ = (selector) => document.querySelector(selector);
const show = (selector, visible) => { const node=$(selector); if(node) node.hidden=!visible; };
const message = (selector, text, error=false) => { const node=$(selector); if(!node)return; node.textContent=text||""; node.classList.toggle("error",Boolean(error)); };
const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money = value => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(Number(value||0));
const slugify = value => String(value||"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");

const year=$("#year"); if(year) year.textContent=new Date().getFullYear();
if(!configured){show("#config-notice",true);$("#sign-in-button").disabled=true;$("#sign-up-button").disabled=true;$("#reset-password").disabled=true;}
else boot();

async function boot(){
  const supabase=createClient(config.url,config.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  $("#auth-form").addEventListener("submit",async event=>{
    event.preventDefault(); message("#auth-message","Signing in…");
    const {error}=await supabase.auth.signInWithPassword({email:$("#auth-email").value.trim(),password:$("#auth-password").value});
    message("#auth-message",error?.message||"Signed in.",Boolean(error));
  });
  $("#sign-up-button").addEventListener("click",async()=>{
    message("#auth-message","Creating account…");
    const {data,error}=await supabase.auth.signUp({email:$("#auth-email").value.trim(),password:$("#auth-password").value,options:{emailRedirectTo:location.origin+"/portal.html"}});
    message("#auth-message",error?.message||(data.session?"Account created and signed in.":"Account created. Check your email to confirm it before signing in."),Boolean(error));
  });
  $("#reset-password").addEventListener("click",async()=>{
    const email=$("#auth-email").value.trim(); if(!email){message("#auth-message","Enter your email address first.",true);return;}
    const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:location.origin+"/portal.html"});
    message("#auth-message",error?.message||( "If an account exists for that address, a password reset email has been sent."),Boolean(error));
  });
  $("#sign-out").addEventListener("click",()=>supabase.auth.signOut());
  $("#claim-form").addEventListener("submit",claimSeller);
  $("#application-form").addEventListener("submit",submitApplication);
  $("#product-form").addEventListener("submit",createProduct);
  document.addEventListener("click",handleModeration);
  supabase.auth.onAuthStateChange((_event,session)=>{setTimeout(()=>renderSession(session),0);});
  const {data:{session}}=await supabase.auth.getSession(); await renderSession(session);

  async function renderSession(session){
    show("#auth-panel",!session);show("#workspace",Boolean(session));
    if(!session)return;
    $("#account-label").textContent=session.user.email||"Signed-in account";
    message("#workspace-message","Checking account permissions…");
    const {data:isAdmin,error:adminError}=await supabase.rpc("is_marketplace_admin");
    if(adminError){message("#workspace-message","Could not verify account permissions. Apply the base schema and marketplace migrations, then sign in again.",true);return;}
    show("#admin-workspace",Boolean(isAdmin));show("#seller-workspace",!isAdmin);
    $("#workspace-title").textContent=isAdmin?"Administrator dashboard":"Seller workspace";
    if(isAdmin) await loadAdmin(); else await loadSeller(session.user);
  }

  async function loadSeller(user){
    message("#workspace-message","Loading your seller workspace…");
    const {data:sellers,error}=await supabase.from("sellers").select("id,store_name,slug,status,created_at").eq("owner_user_id",user.id).limit(1);
    if(error){message("#workspace-message",error.message,true);return;}
    const seller=sellers?.[0];
    if(!seller){
      window.currentSellerId=null;
      show("#product-form-card",false);
      const {data:applications,error:applicationError}=await supabase.from("seller_applications").select("id,business_name,status,created_at").eq("applicant_id",user.id).order("created_at",{ascending:false}).limit(1);
      if(applicationError){message("#workspace-message",applicationError.message,true);return;}
      const application=applications?.[0];
      show("#application-card",!application);
      show("#claim-card",application?.status==="approved");
      if(application){
        $("#seller-stats").innerHTML=stat("Shop status","Not claimed")+stat("Application",application.status)+stat("Listings","—")+stat("Orders","—");
        if(application.status==="approved"){
          $("#claim-application").value=application.id;
          message("#workspace-message",`Good news — ${application.business_name} has been approved. Claim your shop below.`);
        }else{
          message("#workspace-message",`Your application for ${application.business_name} is ${application.status}. You can return here to check its progress.`);
        }
      }else{
        $("#seller-stats").innerHTML=stat("Shop status","Not claimed")+stat("Next step","Apply")+stat("Listings","—")+stat("Orders","—");
        message("#workspace-message","No seller application is linked to this account yet. Complete the application form below to get started.");
      }
      return;
    }
    show("#application-card",false);
    show("#claim-card",false);
    window.currentSellerId=seller.id;
    $("#seller-stats").innerHTML=stat("Shop",seller.store_name)+stat("Status",seller.status)+stat("Listings","Loading…")+stat("Order items","Read only");
    show("#product-form-card",seller.status==="active");
    message("#workspace-message",seller.status==="active"?"Your shop is active. New product submissions are held for review.":`Your shop status is ${seller.status}. Product listing is available after an administrator verifies and activates your storefront.`);
    await Promise.all([loadSellerProducts(seller.id,seller.status),loadSellerOrders(seller.id),loadCategories()]);
  }

  async function loadSellerProducts(sellerId,sellerStatus){
    const {data,error}=await supabase.from("products").select("id,name,price_usd,inventory_quantity,status").eq("seller_id",sellerId).order("created_at",{ascending:false});
    if(error){$("#seller-products").innerHTML=row(4,error.message);return;}
    $("#seller-products").innerHTML=data.length?data.map(p=>`<tr><td>${escapeHtml(p.name)}</td><td>${money(p.price_usd)}</td><td>${p.inventory_quantity}</td><td>${pill(p.status)}</td></tr>`).join(""):row(4,"No products yet.");
    $("#seller-stats").innerHTML=stat("Shop","Linked")+stat("Status",sellerStatus)+stat("Listings",data.length)+stat("Pending review",data.filter(p=>p.status==="pending").length);
  }

  async function loadSellerOrders(sellerId){
    const {data,error}=await supabase.from("order_items").select("id,quantity,product_name_snapshot,order_id").eq("seller_id",sellerId).order("created_at",{ascending:false}).limit(50);
    if(error){$("#seller-orders").innerHTML=row(3,"Order items are not available yet.");return;}
    $("#seller-orders").innerHTML=data.length?data.map(o=>`<tr><td>${escapeHtml(o.product_name_snapshot)}</td><td>${o.quantity}</td><td>${escapeHtml(o.order_id.slice(0,8))}</td></tr>`).join(""):row(3,"No order items yet.");
  }

  async function loadCategories(){
    const {data}=await supabase.from("categories").select("id,name").eq("is_active",true).order("sort_order");
    $("#product-category").innerHTML='<option value="">No category selected</option>'+(data||[]).map(c=>`<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("");
  }

  async function submitApplication(event){
    event.preventDefault();
    const user=(await supabase.auth.getUser()).data.user;
    if(!user?.email){message("#workspace-message","A verified account email is required to apply.",true);return;}
    const website=$("#application-website").value.trim();
    if(website){try{if(!["http:","https:"].includes(new URL(website).protocol))throw new Error();}catch{message("#workspace-message","Enter a valid http or https website or social link.",true);return;}}
    const payload={
      applicant_id:user.id,
      business_name:$("#application-business").value.trim(),
      contact_name:$("#application-contact").value.trim(),
      email:user.email,
      country_code:$("#application-country").value,
      website_url:website||null,
      category:$("#application-category").value,
      description:$("#application-description").value.trim(),
      status:"pending"
    };
    message("#workspace-message","Submitting your seller application…");
    const {error}=await supabase.from("seller_applications").insert(payload);
    if(error){message("#workspace-message",error.message,true);return;}
    $("#application-form").reset();
    message("#workspace-message","Application submitted successfully. The marketplace team will review it; you can return here to check its status.");
    await renderSession((await supabase.auth.getSession()).data.session);
  }

  async function claimSeller(event){
    event.preventDefault();message("#workspace-message","Claiming approved application…");
    const {data,error}=await supabase.rpc("claim_approved_seller",{p_application_id:$("#claim-application").value.trim(),p_store_slug:slugify($("#claim-slug").value)});
    if(error){message("#workspace-message",error.message,true);return;}
    message("#workspace-message",`Shop profile created (${data}). It remains pending until an administrator verifies it.`);
    await renderSession((await supabase.auth.getSession()).data.session);
  }

  async function createProduct(event){
    event.preventDefault();if(!window.currentSellerId){message("#workspace-message","No active seller profile found.",true);return;}
    const images=$("#product-images").value.split(/\n/).map(x=>x.trim()).filter(Boolean);
    if(images.some(url=>{try{return !["http:","https:"].includes(new URL(url).protocol)}catch{return true}})){message("#workspace-message","Every image must be a valid http or https URL.",true);return;}
    const name=$("#product-name").value.trim();
    const payload={seller_id:window.currentSellerId,name,slug:slugify(name),description:$("#product-description").value.trim(),price_usd:Number($("#product-price").value),inventory_quantity:Number($("#product-stock").value),image_urls:images,status:"pending",category_id:$("#product-category").value||null};
    message("#workspace-message","Submitting product for review…");
    const {error}=await supabase.from("products").insert(payload);
    if(error){message("#workspace-message",error.message,true);return;}
    $("#product-form").reset();message("#workspace-message","Product submitted. It will remain hidden until an administrator approves it.");
    await loadSellerProducts(window.currentSellerId);
  }

  async function loadAdmin(){
    message("#workspace-message","Loading moderation queues…");
    const [apps,sellers,products,orders]=await Promise.all([
      supabase.from("seller_applications").select("id,business_name,contact_name,email,category,status,created_at").order("created_at",{ascending:false}).limit(100),
      supabase.from("sellers").select("id,store_name,slug,status,owner_user_id").order("created_at",{ascending:false}).limit(100),
      supabase.from("products").select("id,name,price_usd,status,seller_id,sellers(store_name)").order("created_at",{ascending:false}).limit(100),
      supabase.from("orders").select("id,status,grand_total").limit(100)
    ]);
    const failed=[apps,sellers,products].find(x=>x.error);
    if(failed){message("#workspace-message",failed.error.message,true);return;}
    $("#admin-applications").innerHTML=apps.data.length?apps.data.map(a=>`<tr><td><strong>${escapeHtml(a.business_name)}</strong><small class="table-sub">${escapeHtml(a.email)}</small></td><td>${escapeHtml(a.contact_name)}</td><td>${escapeHtml(a.category)}</td><td>${pill(a.status)}</td><td>${a.status==="pending"||a.status==="under_review"?`<button class="table-action" data-review-app="${a.id}" data-decision="under_review">Review</button><button class="table-action primary" data-review-app="${a.id}" data-decision="approved">Approve</button><button class="table-action danger" data-review-app="${a.id}" data-decision="rejected">Reject</button>`:"—"}</td></tr>`).join(""):row(5,"No applications in the database.");
    $("#admin-sellers").innerHTML=sellers.data.length?sellers.data.map(s=>`<tr><td><strong>${escapeHtml(s.store_name)}</strong><small class="table-sub">${escapeHtml(s.slug)}</small></td><td>${escapeHtml(s.owner_user_id.slice(0,8))}…</td><td>${pill(s.status)}</td><td>${s.status==="pending"?`<button class="table-action primary" data-seller-status="${s.id}" data-status="active">Activate</button>`:`<button class="table-action" data-seller-status="${s.id}" data-status="paused">Pause</button><button class="table-action danger" data-seller-status="${s.id}" data-status="suspended">Suspend</button>`}</td></tr>`).join(""):row(4,"No seller profiles yet.");
    $("#admin-products").innerHTML=products.data.length?products.data.map(p=>`<tr><td>${escapeHtml(p.name)}</td><td>${escapeHtml(p.sellers?.store_name||"—")}</td><td>${money(p.price_usd)}</td><td>${pill(p.status)}</td><td>${p.status==="pending"?`<button class="table-action primary" data-review-product="${p.id}" data-decision="active">Publish</button><button class="table-action danger" data-review-product="${p.id}" data-decision="rejected">Reject</button>`:"—"}</td></tr>`).join(""):row(5,"No products awaiting review.");
    $("#admin-stats").innerHTML=stat("Applications",apps.data.length)+stat("Seller shops",sellers.data.length)+stat("Products",products.data.length)+stat("Orders",orders.error?"—":orders.data.length);
    message("#workspace-message","Moderation queues loaded. Payment, refunds and payouts are intentionally unavailable in this portal.");
  }

  async function handleModeration(event){
    const app=event.target.closest("[data-review-app]");
    const seller=event.target.closest("[data-seller-status]");
    const product=event.target.closest("[data-review-product]");
    let result;
    if(app){
      const notes=prompt("Optional reviewer note (do not enter sensitive personal data):")||null;
      result=await supabase.rpc("review_seller_application",{p_application_id:app.dataset.reviewApp,p_decision:app.dataset.decision,p_reviewer_notes:notes});
    }else if(seller){
      if(!confirm(`Change seller status to ${seller.dataset.status}?`))return;
      result=await supabase.rpc("set_seller_moderation_status",{p_seller_id:seller.dataset.sellerStatus,p_status:seller.dataset.status});
    }else if(product){
      if(!confirm(`Set product status to ${product.dataset.decision}?`))return;
      result=await supabase.rpc("review_marketplace_product",{p_product_id:product.dataset.reviewProduct,p_decision:product.dataset.decision});
    }else return;
    if(result.error){message("#workspace-message",result.error.message,true);return;}
    message("#workspace-message","Moderation decision saved.");
    await loadAdmin();
  }
}

function stat(label,value){return `<div class="stat-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;}
function row(span,text){return `<tr><td class="empty-cell" colspan="${span}">${escapeHtml(text)}</td></tr>`;}
function pill(status){return `<span class="status-pill ${escapeHtml(status)}">${escapeHtml(status)}</span>`;}
