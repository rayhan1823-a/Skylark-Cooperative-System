import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";


function EditMember(){

const {id}=useParams();
const navigate=useNavigate();


const [formData,setFormData]=useState({});
const [loading,setLoading]=useState(true);



// ======================
// Load Member
// ======================

const loadMember = async()=>{

try{


const res = await axios.get(

`https://skylark-cooperative-system.onrender.com/api/members/profile/${id}`

);


setFormData(res.data.member);


}

catch(error){

console.log(error);

}

finally{

setLoading(false);

}


};




useEffect(()=>{

loadMember();

},[id]);







// ======================
// Input Change
// ======================


const handleChange=(e)=>{


setFormData({

...formData,

[e.target.name]:e.target.value

});


};






// ======================
// Update Member
// ======================


const updateMember=async()=>{


try{


await axios.put(

`https://skylark-cooperative-system.onrender.com/api/members/${id}`,

formData

);


alert(
"✅ Member Updated Successfully"
);


navigate("/members");


}

catch(error){


console.log(error);


alert(
"❌ Update Failed"
);


}


};








if(loading){


return(

<MainLayout>

<div className="p-10 text-center text-xl">

Loading...

</div>


</MainLayout>

)


}








return(

<MainLayout>



<h1 className="text-3xl font-bold mb-6">

Edit Member

</h1>





<div className="bg-white shadow rounded-xl p-6">


<div className="grid md:grid-cols-2 gap-5">






<Field
label="Member ID"
name="memberId"
value={formData.memberId}
change={handleChange}
/>





<Field
label="Full Name"
name="name"
value={formData.name}
change={handleChange}
/>






<Field
label="Father Name"
name="fatherName"
value={formData.fatherName}
change={handleChange}
/>






<Field
label="Mother Name"
name="motherName"
value={formData.motherName}
change={handleChange}
/>






<Field
label="Phone Number"
name="phone"
value={formData.phone}
change={handleChange}
/>






<Field
label="Emergency Contact"
name="emergencyContact"
value={formData.emergencyContact}
change={handleChange}
/>






<Field
label="Blood Group"
name="bloodGroup"
value={formData.bloodGroup}
change={handleChange}
/>






<Field
label="NID Number"
name="nid"
value={formData.nid}
change={handleChange}
/>










<DateField

label="Date of Birth"

name="dateOfBirth"

value={formData.dateOfBirth}

change={handleChange}

/>






<DateField

label="Joining Date"

name="joiningDate"

value={formData.joiningDate}

change={handleChange}

/>










<div>


<label className="font-semibold">

Status

</label>


<select

name="status"

value={formData.status || "Active"}

onChange={handleChange}

className="border p-3 rounded-lg w-full"

>


<option value="Active">
Active
</option>


<option value="Inactive">
Inactive
</option>


<option value="Exited">
Exited
</option>


</select>


</div>










<Field

label="Nominee Name"

name="nomineeName"

value={formData.nomineeName}

change={handleChange}

/>






<Field

label="Nominee Relation"

name="nomineeRelation"

value={formData.nomineeRelation}

change={handleChange}

/>





<div>


<label className="font-semibold">

Nominee NID File

</label>


<input

value={formData.nomineeNid || ""}

readOnly

className="border p-3 rounded-lg w-full bg-gray-100"

/>



</div>






</div>








<div className="mt-5">


<label className="font-semibold">

Present Address

</label>


<textarea

name="presentAddress"

value={formData.presentAddress || ""}

onChange={handleChange}

rows="3"

className="border p-3 rounded-lg w-full"

></textarea>


</div>








<div className="mt-5">


<label className="font-semibold">

Permanent Address

</label>


<textarea

name="permanentAddress"

value={formData.permanentAddress || ""}

onChange={handleChange}

rows="3"

className="border p-3 rounded-lg w-full"

></textarea>


</div>









<button

onClick={updateMember}

className="mt-6 bg-green-600 text-white px-10 py-3 rounded-lg"

>


Update Member


</button>






</div>



</MainLayout>


)


}











// ======================
// Text Field Component
// ======================


function Field({

label,

name,

value,

change

}){


return(

<div>


<label className="font-semibold">

{label}

</label>


<input

name={name}

value={value || ""}

onChange={change}

className="border p-3 rounded-lg w-full"

/>


</div>


)


}








// ======================
// Date Field Component
// ======================


function DateField({

label,

name,

value,

change

}){


return(

<div>


<label className="font-semibold">

{label}

</label>


<input

type="date"

name={name}

value={

value

?

value.substring(0,10)

:

""

}

onChange={change}

className="border p-3 rounded-lg w-full"

/>


</div>


)


}





export default EditMember;