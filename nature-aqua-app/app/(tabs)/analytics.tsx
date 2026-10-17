import { 
  useEffect, 
  useState, 
  useCallback 
} from "react";

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from "react-native";


import { 
  LineChart 
} from "react-native-chart-kit";


import { 
  MaterialIcons 
} from "@expo/vector-icons";


import { C } from "@/constants/theme";
import { API_BASE_URL } from "@/constants/api";



const screenW = Dimensions.get("window").width;



const hexToRgb = (hex:string)=>{

  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);

  return `${r},${g},${b}`;

};



const CLAMP:any = {

  ph:{
    min:0,
    max:14
  },

  temperature:{
    min:15,
    max:45
  },

  ammonia:{
    min:0,
    max:10
  },

  nitrite:{
    min:0,
    max:10
  },

  nitrate:{
    min:0,
    max:200
  }

};



const clampArr = (
  arr:number[],
  key:string
)=>{

  const c =
    CLAMP[key] ||
    {
      min:0,
      max:999
    };


  return arr.map(
    (v)=>
    Math.max(
      c.min,
      Math.min(
        c.max,
        v
      )
    )
  );

};





export default function AnalyticsScreen(){


const [analytics,setAnalytics] = useState<any>(null);

const [loading,setLoading] = useState(true);

const [refreshing,setRefreshing] = useState(false);

const [error,setError] = useState("");

const [useCharts,setUseCharts] = useState(true);




const loadData = useCallback(async()=>{


  setError("");


  try{


    const res = await fetch(
      `${API_BASE_URL}/analytics`
    );


    const data =
      await res.json();


    setAnalytics(data);



  }catch{


    setError(
      "Could not connect to server. Pull down to retry."
    );


  }finally{


    setLoading(false);

    setRefreshing(false);

  }


},[]);




useEffect(()=>{

 loadData();

},[loadData]);




const onRefresh =
useCallback(()=>{

 setRefreshing(true);

 loadData();


},[loadData]);




const chartW =
screenW - 72;



const safeSlice = (
 arr:any[]|undefined,
 n=7
)=>{


 if(
   !arr ||
   !Array.isArray(arr) ||
   arr.length===0
 )
 return null;



 const sliced =
 arr
 .slice(-n)
 .map(Number);



 if(
   sliced.some(isNaN)
 )
 return null;



 return sliced;


};





const makeConfig = (
 color:string,
 decimals=1
)=>({


 backgroundGradientFrom:C.card,

 backgroundGradientTo:C.card,


 decimalPlaces:decimals,


 color:(opacity=1)=>
 `rgba(${hexToRgb(color)},${opacity})`,


 labelColor:()=>C.textMuted,


 propsForDots:{

  r:"4",

  strokeWidth:"2",

  stroke:color

 },


 propsForBackgroundLines:{

  stroke:"rgba(255,255,255,0.04)"

 }


});






const renderChart = (
 title:string,
 sub:string,
 data:number|null,
 color:string,
 key:string,
 decimals=1
)=>{


 if(
   !data ||
   !useCharts
 )
 return null;



 const clamped =
 clampArr(
   data as number[],
   key
 );



 return (

<View style={s.chartCard}>


<View style={s.chartHead}>


<View
style={[
s.chartIcon,
{
backgroundColor:`${color}18`
}
]}
>


<MaterialIcons
name="show-chart"
size={20}
color={color}
/>


</View>



<View>

<Text style={s.chartTitle}>
{title}
</Text>


<Text style={s.chartSub}>
{sub}
</Text>


</View>


</View>



<LineChart

data={{
labels:
clamped.map(
(_,i)=>`#${i+1}`
),

datasets:[
{
data:clamped
}
]

}}

width={chartW}

height={185}

chartConfig={
makeConfig(
color,
decimals
)
}

bezier

style={s.chart}

withVerticalLines={false}

/>


</View>

 );


};
// ===============================
// SUMMARY CARDS
// ===============================


const renderSummaryCards = () => {


if(!analytics) return null;



const items = [

{
label:"pH",
data:analytics.ph,
icon:"opacity",
color:C.accent
},

{
label:"Temperature",
data:analytics.temperature,
icon:"thermostat",
color:"#fb923c"
},

{
label:"Ammonia",
data:analytics.ammonia,
icon:"water-drop",
color:"#fbbf24"
},

{
label:"Nitrite",
data:analytics.nitrite,
icon:"water-drop",
color:"#a78bfa"
},

{
label:"Nitrate",
data:analytics.nitrate,
icon:"water-drop",
color:"#34d399"
}

];



return (

<View style={s.sumGrid}>


{
items.map(
(item:any,i:number)=>{


const arr=item.data;


if(
!arr ||
!Array.isArray(arr) ||
arr.length===0
)
return null;



const last =
Number(
arr[arr.length-1]
);



const avg =
(
arr.reduce(
(a:number,b:any)=>
a+Number(b),
0
)
/
arr.length
)
.toFixed(2);



return (

<View
key={i}
style={s.sumCard}
>


<View
style={[
s.sumIconBox,
{
backgroundColor:
`${item.color}15`
}
]}
>

<MaterialIcons

name={item.icon}

size={20}

color={item.color}

/>

</View>



<Text style={s.sumLabel}>
{item.label}
</Text>



<Text style={s.sumVal}>
{
isNaN(last)
?
"–"
:
last
}
</Text>



<Text style={s.sumAvg}>
avg {avg}
</Text>



</View>

);


}

)

}


</View>

);


};





// ===============================
// IMAGE INSIGHTS
// ===============================


const renderImageInsights = ()=>{


if(

!analytics?.water_conditions ||

analytics.water_conditions.length===0

)

return null;




const counts:any={};



analytics.water_conditions.forEach(
(item:string)=>{


counts[item] =
(counts[item] || 0)+1;


}

);





const confidence =

analytics.image_confidences?.length

?

(

analytics.image_confidences.reduce(

(a:number,b:number)=>

a+Number(b),

0

)

/

analytics.image_confidences.length

)

.toFixed(2)

:

"0";





return (

<View style={s.chartCard}>


<View style={s.chartHead}>


<View
style={[
s.chartIcon,
{
backgroundColor:
"rgba(34,211,238,0.15)"
}
]}
>


<MaterialIcons

name="water-drop"

size={20}

color={C.accent}

/>


</View>



<View>

<Text style={s.chartTitle}>
Water Image Insights
</Text>


<Text style={s.chartSub}>
AI based water appearance analysis
</Text>


</View>



</View>





{
Object.keys(counts).map(

(key)=>(


<View
key={key}
style={{
marginTop:10
}}
>


<Text
style={{
color:C.textPrimary,
fontSize:14,
fontWeight:"700"
}}
>


💧 {

key
.replaceAll("_"," ")
.toUpperCase()

}


</Text>



<Text
style={{
color:C.textSecondary,
marginTop:3
}}
>


{counts[key]} analysis


</Text>


</View>


)

)

}






<View
style={{
marginTop:18
}}
>


<Text
style={{
color:C.accent,
fontWeight:"700"
}}
>

Average AI Confidence

</Text>



<Text
style={{
color:C.textPrimary,
fontSize:22,
fontWeight:"800",
marginTop:5
}}
>


{confidence}%


</Text>



<Text
style={{
color:C.textSecondary,
marginTop:8
}}
>


Total Image Analyses: {

analytics.total_image_predictions

}


</Text>



</View>



</View>


);


};






// ===============================
// LOADING SCREEN
// ===============================


if(loading){


return (

<View style={s.loadWrap}>


<StatusBar
barStyle="light-content"
backgroundColor={C.bg}
/>


<View style={s.loadIcon}>


<MaterialIcons

name="bar-chart"

size={32}

color={C.accent}

/>


</View>



<ActivityIndicator

size="large"

color={C.accent}

style={{
marginTop:20
}}

/>



<Text style={s.loadText}>

Loading analytics…

</Text>



</View>


);


}
// ===============================
// MAIN SCREEN
// ===============================


const phData =
safeSlice(
analytics?.ph
);


const ammoniaData =
safeSlice(
analytics?.ammonia
);


const tempData =
safeSlice(
analytics?.temperature
);


const nitrateData =
safeSlice(
analytics?.nitrate
);




return (

<View
style={{
flex:1,
backgroundColor:C.bg
}}
>


<StatusBar

barStyle="light-content"

backgroundColor={C.bg}

/>



<ScrollView


style={{
flex:1
}}


contentContainerStyle={{
paddingBottom:30
}}


showsVerticalScrollIndicator={false}



refreshControl={

<RefreshControl

refreshing={refreshing}

onRefresh={onRefresh}

tintColor={C.accent}

colors={[C.accent]}

progressBackgroundColor={C.card}

/>

}



>




{/* HEADER */}


<View style={s.header}>


<View style={s.hIcon}>


<MaterialIcons

name="bar-chart"

size={28}

color={C.accent}

/>


</View>



<Text style={s.hTitle}>
Analytics
</Text>



<Text style={s.hSub}>
Water quality trends and insights
</Text>



<View style={s.hLine}/>



</View>





{/* ERROR */}


{

error ?

<View style={s.errBox}>


<MaterialIcons

name="wifi-off"

size={18}

color={C.red}

/>



<Text style={s.errTxt}>

{error}

</Text>


</View>

:

null

}





{/* ACTION BUTTONS */}



<View style={s.actRow}>


<TouchableOpacity

style={s.refBtn}

onPress={onRefresh}

activeOpacity={0.7}

>


<MaterialIcons

name="refresh"

size={18}

color={C.accent}

/>



<Text style={s.refText}>

Refresh

</Text>


</TouchableOpacity>





{

analytics &&

<TouchableOpacity

style={s.togBtn}

onPress={()=>setUseCharts(!useCharts)}

activeOpacity={0.7}

>


<MaterialIcons

name={
useCharts
?
"grid-view"
:
"show-chart"
}

size={16}

color={C.textSecondary}

/>



<Text style={s.togText}>

{

useCharts
?
"Cards"
:
"Charts"

}

</Text>



</TouchableOpacity>


}



</View>






{/* SUMMARY */}



{

analytics && !useCharts

&&

renderSummaryCards()

}






{/* IMAGE ANALYTICS */}



{

analytics &&

renderImageInsights()

}







{/* CHARTS */}



{

renderChart(

"pH Trend",

`Last ${phData?.length ?? 0} readings`,

phData,

C.accent,

"ph"

)

}





{

renderChart(

"Temperature Trend",

`Last ${tempData?.length ?? 0} readings (°C)`,

tempData,

"#fb923c",

"temperature"

)

}





{

renderChart(

"Ammonia Trend",

`Last ${ammoniaData?.length ?? 0} readings (mg/L)`,

ammoniaData,

"#fbbf24",

"ammonia",

3

)

}





{

renderChart(

"Nitrate Trend",

`Last ${nitrateData?.length ?? 0} readings (mg/L)`,

nitrateData,

"#34d399",

"nitrate"

)

}







{

!analytics && !error &&

<View style={s.emptyCard}>


<MaterialIcons

name="bar-chart"

size={48}

color={C.textMuted}

/>


<Text style={s.emptyTitle}>

No Analytics Data

</Text>


<Text style={s.emptyText}>

Run some predictions first to see trends!

</Text>


</View>

}





<View
style={{
height:40
}}
/>



</ScrollView>


</View>


);
}

const s = StyleSheet.create({

loadWrap:{
flex:1,
justifyContent:"center",
alignItems:"center",
backgroundColor:C.bg
},

loadIcon:{
width:64,
height:64,
borderRadius:22,
backgroundColor:"rgba(34,211,238,0.1)",
justifyContent:"center",
alignItems:"center"
},

loadText:{
marginTop:16,
fontSize:15,
color:C.textSecondary
},

header:{
alignItems:"center",
paddingTop:56,
paddingBottom:20
},

hIcon:{
width:56,
height:56,
borderRadius:20,
backgroundColor:"rgba(34,211,238,0.1)",
justifyContent:"center",
alignItems:"center"
},

hTitle:{
fontSize:26,
fontWeight:"800",
color:"#fff",
marginTop:14
},

hSub:{
fontSize:13,
color:C.textSecondary,
marginTop:6
},

hLine:{
width:40,
height:3,
backgroundColor:C.accent,
marginTop:14
},

actRow:{
flexDirection:"row",
marginHorizontal:16,
marginBottom:16,
gap:10
},

refBtn:{
flex:1,
flexDirection:"row",
justifyContent:"center",
alignItems:"center",
gap:8,
paddingVertical:12,
borderRadius:14,
borderWidth:1.5,
borderColor:C.accent
},

refText:{
color:C.accent,
fontWeight:"700"
},

togBtn:{
flexDirection:"row",
alignItems:"center",
gap:6,
paddingHorizontal:16,
paddingVertical:12,
borderRadius:12,
backgroundColor:"rgba(255,255,255,0.05)"
},

togText:{
color:C.textSecondary
},

chartCard:{
backgroundColor:C.card,
marginHorizontal:16,
marginBottom:16,
borderRadius:18,
padding:18,
borderWidth:1,
borderColor:C.cardBorder
},

chartHead:{
flexDirection:"row",
alignItems:"center",
gap:12,
marginBottom:16
},

chartIcon:{
width:40,
height:40,
borderRadius:12,
justifyContent:"center",
alignItems:"center"
},

chartTitle:{
color:C.textPrimary,
fontSize:15,
fontWeight:"700"
},

chartSub:{
color:C.textMuted,
fontSize:12
},

chart:{
borderRadius:12
},

sumGrid:{
flexDirection:"row",
flexWrap:"wrap"
},

sumCard:{
backgroundColor:C.card,
borderRadius:16,
padding:16,
width:"47%",
margin:5
},

sumIconBox:{
width:40,
height:40,
borderRadius:12,
justifyContent:"center",
alignItems:"center"
},

sumLabel:{
color:C.textMuted
},

sumVal:{
color:C.textPrimary,
fontSize:22,
fontWeight:"800"
},

sumAvg:{
color:C.textMuted
},

errBox:{
flexDirection:"row",
margin:16,
padding:14,
borderRadius:14,
backgroundColor:C.redBg
},

errTxt:{
color:C.red,
flex:1
},

emptyCard:{
margin:16,
padding:40,
alignItems:"center",
backgroundColor:C.card,
borderRadius:20
},

emptyTitle:{
color:C.textPrimary,
fontSize:18,
fontWeight:"700"
},

emptyText:{
color:C.textMuted
}

});
