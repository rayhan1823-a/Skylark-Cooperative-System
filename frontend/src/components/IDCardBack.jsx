import React from "react";
import QRCode from "react-qr-code";


function IDCardBack({ member }) {


  if (!member) return null;


  const qrValue =
    `${window.location.origin}/member/${member._id}`;



  return (


<div

className="
relative
w-[340px]
h-[600px]
bg-white
rounded-2xl
overflow-hidden
shadow-2xl
border-2
border-blue-700
"

>



{/* ==========================
 Header
========================== */}


<div

className="
bg-gradient-to-r
from-blue-900
via-blue-700
to-sky-500
text-white
text-center
py-4
"

>


<img

src="/images/logo.jpeg"

alt="Logo"

className="
w-14
h-14
mx-auto
rounded-full
bg-white
p-1
shadow
"

/>



<h2 className="
text-base
font-bold
mt-1
">

Skylark Cooperative Society

</h2>



<p className="
text-[10px]
tracking-[3px]
">

CARD VERIFICATION

</p>


</div>









{/* Watermark */}


<img

src="/images/logo.jpeg"

alt="Watermark"

className="
absolute
w-52
opacity-5
top-40
left-1/2
-translate-x-1/2
pointer-events-none
"

/>









{/* ==========================
 QR Code
========================== */}


<div className="
flex
justify-center
mt-6
">


<div className="
bg-white
p-2
border
rounded-lg
shadow
">


<QRCode

value={qrValue}

size={110}

/>


</div>


</div>






<div className="
text-center
mt-2
">


<p className="
font-bold
text-blue-700
text-sm
">

Scan to Verify Member

</p>



<p className="
text-[11px]
text-gray-500
">

Scan QR Code to view

<br/>

official member profile

</p>


</div>









{/* ==========================
 Office Information
========================== */}


<div className="
px-6
mt-5
text-xs
text-gray-700
space-y-2
">



<p>

<span className="font-bold">
Office:
</span>

<br/>

Skylark Cooperative Society

</p>





<p>

<span className="font-bold">
Address:
</span>

<br/>

241/1-C, South Pirerbag

<br/>

Mirpur, Dhaka-1216

</p>





<p>

<span className="font-bold">
Phone:
</span>

<br/>

01400-444424

</p>





<p>

<span className="font-bold">
Email:
</span>

<br/>

info@skylarkcoop.com

</p>



</div>









{/* ==========================
 Terms
========================== */}



<div className="
px-6
mt-3
">


<h3 className="
text-sm
font-bold
text-blue-700
mb-1
">

Terms & Conditions

</h3>




<ul

className="
text-[10px]
text-gray-600
list-disc
ml-4
space-y-1
"

>


<li>
This card is property of Skylark Cooperative Society.
</li>


<li>
Carry this card during official activities.
</li>


<li>
Report lost card to office immediately.
</li>


<li>
Misuse of card is prohibited.
</li>


</ul>



</div>









{/* ==========================
 Authorized Signature
========================== */}



<div className="
flex
justify-end
px-6
mt-4
">


<div className="
text-center
">


<div className="
h-8
">
</div>



<div className="
border-t
border-black
w-28
">

</div>



<p className="
text-[10px]
font-semibold
mt-1
">

Authorized Signature

</p>



<p className="
text-[9px]
text-gray-500
">

Skylark Cooperative Society

</p>


</div>



</div>









{/* ==========================
 Footer
========================== */}



<div

className="
absolute
bottom-0
left-0
w-full
bg-gradient-to-r
from-blue-900
via-blue-700
to-sky-500
text-white
text-center
py-2
"

>


<p className="
font-bold
text-sm
">

Skylark Cooperative Society

</p>



<p className="
text-[10px]
">

Established 2023

</p>


</div>





</div>


  );

}



export default IDCardBack;