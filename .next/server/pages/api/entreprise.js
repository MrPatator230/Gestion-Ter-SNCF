"use strict";(()=>{var e={};e.id=9304,e.ids=[9304],e.modules={425:(e,t,r)=>{r.r(t),r.d(t,{config:()=>_,default:()=>c,routeModule:()=>p});var o={};r.r(o),r.d(o,{default:()=>l});var n=r(3480),a=r(8667),s=r(6435),i=r(967);async function l(e,t){if("GET"===e.method){let e;try{e=await i.A.getConnection();let[r]=await e.query("SELECT * FROM entreprise_settings ORDER BY id DESC LIMIT 1");if(0===r.length)return t.status(200).json({entrepriseSettings:null,footerRegions:[],trainTypes:[]});let o=r[0],[n]=await e.query("SELECT * FROM footer_regions WHERE entreprise_id = ?",[o.id]),[a]=await e.query("SELECT * FROM train_types WHERE entreprise_id = ?",[o.id]);t.status(200).json({entrepriseSettings:o,footerRegions:n,trainTypes:a})}catch(e){console.error("Error fetching entreprise data:",e),t.status(500).json({error:"Failed to fetch entreprise data"})}finally{e&&e.release()}}else if("POST"===e.method){let{entrepriseSettings:r,footerRegions:o,trainTypes:n}=e.body;if(!r)return t.status(400).json({error:"Missing entrepriseSettings data"});let a=await i.A.getConnection();try{let e;if(await a.beginTransaction(),r.id){let t=`
          UPDATE entreprise_settings SET
            company_name = ?,
            company_slogan = ?,
            company_description = ?,
            primary_color = ?,
            secondary_color = ?,
            accent_color = ?,
            app_name = ?,
            logo_url = ?,
            favicon_url = ?,
            font_family = ?,
            button_style = ?,
            header_style = ?,
            footer_content = ?,
            custom_css = ?,
            updated_at = NOW()
          WHERE id = ?
        `;await a.query(t,[r.company_name,r.company_slogan,r.company_description,r.primary_color,r.secondary_color,r.accent_color,r.app_name,r.logo_url,r.favicon_url,r.font_family,r.button_style,r.header_style,r.footer_content,r.custom_css,r.id]),e=r.id}else{let t=`
          INSERT INTO entreprise_settings (
            company_name, company_slogan, company_description,
            primary_color, secondary_color, accent_color,
            app_name, logo_url, favicon_url,
            font_family, button_style, header_style,
            footer_content, custom_css
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,[o]=await a.query(t,[r.company_name,r.company_slogan,r.company_description,r.primary_color,r.secondary_color,r.accent_color,r.app_name,r.logo_url,r.favicon_url,r.font_family,r.button_style,r.header_style,r.footer_content,r.custom_css]);e=o.insertId}if(await a.query("DELETE FROM footer_regions WHERE entreprise_id = ?",[e]),Array.isArray(o))for(let t of o)await a.query("INSERT INTO footer_regions (entreprise_id, name, link) VALUES (?, ?, ?)",[e,t.name,t.link]);if(await a.query("DELETE FROM train_types WHERE entreprise_id = ?",[e]),Array.isArray(n))for(let t of n)await a.query("INSERT INTO train_types (entreprise_id, type_name, logo_url) VALUES (?, ?, ?)",[e,t.type_name,t.logo_url]);await a.commit(),t.status(200).json({message:"Entreprise data saved successfully"})}catch(e){await a.rollback(),console.error("Error saving entreprise data:",e),t.status(500).json({error:"Failed to save entreprise data"})}finally{a.release()}}else t.setHeader("Allow",["GET","POST"]),t.status(405).end(`Method ${e.method} Not Allowed`)}let c=(0,s.M)(o,"default"),_=(0,s.M)(o,"config"),p=new n.PagesAPIRouteModule({definition:{kind:a.A.PAGES_API,page:"/api/entreprise",pathname:"/api/entreprise",bundlePath:"",filename:""},userland:o})},967:(e,t,r)=>{r.d(t,{A:()=>n});var o=r(1117);let n=r.n(o)().createPool({host:process.env.MYSQL_HOST||"127.0.0.1",port:process.env.MYSQL_PORT||8889,user:process.env.MYSQL_USER||"root",password:process.env.MYSQL_PASSWORD||"root",database:process.env.MYSQL_DATABASE||"SNCF_ter_bfc",waitForConnections:!0,queueLimit:1e3})},1117:e=>{e.exports=require("mysql2/promise")},3480:(e,t,r)=>{e.exports=r(5600)},5600:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},6435:(e,t)=>{Object.defineProperty(t,"M",{enumerable:!0,get:function(){return function e(t,r){return r in t?t[r]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,r)):"function"==typeof t&&"default"===r?t:void 0}}})},8667:(e,t)=>{Object.defineProperty(t,"A",{enumerable:!0,get:function(){return r}});var r=function(e){return e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE",e.IMAGE="IMAGE",e}({})}};var t=require("../../webpack-api-runtime.js");t.C(e);var r=t(t.s=425);module.exports=r})();