import icons from "@/constants/icons";
import images from '@/constants/images';
import * as React from 'react';
import { Text, View, StyleSheet, ScrollView, Image, TouchableOpacity} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SignIn = () =>{
    const handleLogin = ()=>{
        return ""
    }
    return (
        <SafeAreaView className='bg-white h-full'>
            <ScrollView contentContainerClassName='h-full'>
                <Image source={images.onboarding} className="w-full h-4/6" resizeMode="contain"/>
                <View className="px-10">
                    <Text className="text-center uppercase font-rubik text-black-200">Bienvenue sur Roogo</Text>
                    <Text className="text-3xl text-center mt-2 font-rubik-bold text-primary-300">
                        Trouver la maison idéale!
                    </Text>
                    <TouchableOpacity onPress={handleLogin} className="bg-white shadow-md shadown-zinc rounded-full w-3/4 py-4 mt-14 mx-auto">
                        <View className="flex flex-row items-center justify-center">
                           <Image source={icons.google} resizeMode="contain" className="w-5 h-5"/>
                           <Text className="text-lg font-rubik-medium text-black-300 ml-2">Continuer avec Google</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default SignIn;

