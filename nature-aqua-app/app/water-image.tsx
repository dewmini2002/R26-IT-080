import React, { useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { API_BASE_URL } from "../constants/api";



export default function WaterImageScreen() {


  const [image, setImage] = useState<string | null>(null);

  const [prediction, setPrediction] = useState("");

  const [confidence, setConfidence] = useState<number | null>(null);

  const [waterCondition, setWaterCondition] = useState<any>(null);

  const [loading, setLoading] = useState(false);






  const pickImage = async () => {


    const result =
      await ImagePicker.launchImageLibraryAsync({

        mediaTypes:["images"],

        allowsEditing:true,

        quality:1,

      });



    if(!result.canceled){


      const imageUri =
        result.assets[0].uri;


      setImage(imageUri);


      uploadImage(imageUri);

    }

  };









  const uploadImage = async(imageUri:string)=>{


    try{


      setLoading(true);


      setPrediction("");

      setConfidence(null);

      setWaterCondition(null);




      const formData = new FormData();



      formData.append(

        "file",

        {

          uri:imageUri,

          name:"water.jpg",

          type:"image/jpeg",

        } as any

      );





      const response =
        await fetch(

          `${API_BASE_URL}/predict-water-image`,

          {

            method:"POST",

            body:formData,

            headers:{

              "Content-Type":
              "multipart/form-data"

            }

          }

        );




      const data =
        await response.json();
      console.log("IMAGE API RESPONSE:", data);



      setPrediction(
        data.prediction
      );


      setConfidence(
        data.confidence
      );


      setWaterCondition(
        data.water_condition
      );



    }


    catch(error){


      console.log(
        "IMAGE ERROR",
        error
      );


      setPrediction(
        "Prediction Failed"
      );


    }


    finally{

      setLoading(false);

    }


  };









  return (



    <ScrollView

      style={styles.container}

      contentContainerStyle={styles.content}

    >






      <View style={styles.header}>


        <View style={styles.iconCircle}>


          <MaterialIcons

            name="water-drop"

            size={35}

            color="#00D4FF"

          />


        </View>




        <Text style={styles.title}>

          Water Image Analysis

        </Text>




        <Text style={styles.subtitle}>

          AI-based aquarium water condition detection

        </Text>



      </View>









      {
        image && (

          <View style={styles.imageCard}>


            <Image

              source={{
                uri:image
              }}

              style={styles.preview}

            />


          </View>

        )
      }









      <TouchableOpacity

        onPress={pickImage}

        activeOpacity={0.8}

        style={{marginTop:25}}

      >


        <LinearGradient

          colors={[
            "#00B4D8",
            "#0077B6"
          ]}

          style={styles.button}

        >


          <MaterialIcons

            name="add-photo-alternate"

            size={22}

            color="white"

          />



          <Text style={styles.buttonText}>

            Select Water Image

          </Text>



        </LinearGradient>



      </TouchableOpacity>









      {
        loading && (

          <ActivityIndicator

            size="large"

            color="#00B4D8"

            style={{
              marginTop:25
            }}

          />

        )
      }









      {
        prediction && !loading && (


          <View style={styles.card}>


            <View style={styles.cardHeader}>


              <View style={styles.smallIcon}>


                <MaterialIcons

                  name="analytics"

                  size={22}

                  color="#00D4FF"

                />


              </View>



              <Text style={styles.cardTitle}>

                AI Prediction

              </Text>



            </View>





            <Text style={styles.prediction}>


              {
                prediction
                .replace("_"," ")
                .toUpperCase()
              }


            </Text>




            <Text style={styles.infoText}>

              Confidence : {confidence}%

            </Text>



          </View>

        )
      }









      {
        waterCondition && (



          <View style={styles.card}>


            <View style={styles.cardHeader}>


              <View style={styles.smallIcon}>


                <MaterialIcons

                  name="water"

                  size={22}

                  color="#00D4FF"

                />


              </View>




              <Text style={styles.cardTitle}>

                Water Condition

              </Text>


            </View>








            <Text style={styles.label}>

              Risk Level

            </Text>





            <Text

              style={[

                styles.risk,

                {

                  color:

                  waterCondition.risk_level === "High"

                  ?

                  "#FF4D4D"


                  :

                  waterCondition.risk_level === "Moderate"

                  ?

                  "#FFB703"


                  :

                  "#4ADE80"

                }

              ]}


            >

              {waterCondition.risk_level}


            </Text>









            <Text style={styles.label}>

              Possible Cause

            </Text>




            <Text style={styles.infoText}>

              {waterCondition.reason}

            </Text>









            <Text style={styles.label}>

              Water Change

            </Text>



            <Text style={styles.infoText}>

              {waterCondition.water_change}

            </Text>








            <Text style={styles.label}>

              Next Check

            </Text>




            <Text style={styles.infoText}>

              {waterCondition.next_check}

            </Text>









            <Text style={styles.label}>

              Recommended Actions

            </Text>






            {
              waterCondition.recommendations.map(

                (item:string,index:number)=>(


                  <Text

                    key={index}

                    style={styles.recommendation}

                  >

                    ✓ {item}

                  </Text>


                )

              )
            }









            <Text style={styles.label}>

              AI Insight

            </Text>




            <Text style={styles.infoText}>

              The AI model detected {

              prediction.replace("_"," ")

              }

              condition based on water appearance analysis.

              This may indicate {

              waterCondition.reason.toLowerCase()

              }


            </Text>






          </View>


        )
      }





    </ScrollView>


  );

}









const styles = StyleSheet.create({



container:{

  flex:1,

  backgroundColor:"#081525",

},



content:{

  padding:20,

  paddingBottom:50,

  alignItems:"center",

},



header:{

  alignItems:"center",

  marginTop:30,

},




iconCircle:{

  width:80,

  height:80,

  borderRadius:40,

  backgroundColor:"#102C42",

  justifyContent:"center",

  alignItems:"center",

  borderWidth:1,

  borderColor:"#145B78",

},




title:{

  color:"#FFFFFF",

  fontSize:25,

  fontWeight:"700",

  marginTop:20,

},




subtitle:{

  color:"#8FA7C0",

  marginTop:8,

  textAlign:"center",

},




imageCard:{

  marginTop:30,

  padding:10,

  backgroundColor:"#13263A",

  borderRadius:20,

  borderWidth:1,

  borderColor:"#21415F",

},




preview:{

  width:240,

  height:240,

  borderRadius:15,

},




button:{

  flexDirection:"row",

  alignItems:"center",

  paddingVertical:15,

  paddingHorizontal:25,

  borderRadius:15,

},




buttonText:{

  color:"#FFFFFF",

  fontWeight:"700",

  marginLeft:10,

},




card:{

  width:"100%",

  marginTop:25,

  padding:20,

  borderRadius:20,

  backgroundColor:"#13263A",

  borderWidth:1,

  borderColor:"#21415F",

},




cardHeader:{

  flexDirection:"row",

  alignItems:"center",

},




smallIcon:{

  width:40,

  height:40,

  borderRadius:12,

  backgroundColor:"#17334A",

  justifyContent:"center",

  alignItems:"center",

},




cardTitle:{

  color:"#FFFFFF",

  fontSize:17,

  fontWeight:"700",

  marginLeft:12,

},




prediction:{

  color:"#00D4FF",

  fontSize:23,

  fontWeight:"800",

  marginTop:18,

},




label:{

  color:"#8FA7C0",

  marginTop:18,

  fontSize:13,

  fontWeight:"600",

},




risk:{

  fontSize:22,

  fontWeight:"800",

  marginTop:5,

},




infoText:{

  color:"#D0D8E0",

  fontSize:14,

  marginTop:8,

  lineHeight:21,

},




recommendation:{

  color:"#D0D8E0",

  fontSize:14,

  marginTop:8,

},



});