import React from 'react'
import {
    View,
    Text,
    ScrollView,
    ToastAndroid,
    StyleSheet,
    LayoutAnimation,
    TouchableOpacity
} from 'react-native'
import storage from '@react-native-firebase/storage'
import { useDispatch, useSelector } from 'react-redux'
import { addNewQuestion, updateQuestionList } from '../../../redux/Slice/newQuizSlice'
import { useNavigation, useRoute } from "@react-navigation/native"
import { COLORS } from '../../../common/theme'
import { arrTime } from '../../../common/shareVarible'
import { screenName } from '../../../navigator/screens-name'
import ChooseImgBTN from '../../../components/ChooseImgBTN'
import FormInput from '../../../components/FormInput'
import FormButton from '../../../components/FormButton'
import Icon from "react-native-vector-icons/Entypo"
import Icon1 from "react-native-vector-icons/FontAwesome5"

const CheckBox = () => {

    const route = useRoute()
    const dispatch = useDispatch()
    const navigation = useNavigation()
    const newQuiz = useSelector((state) => state.newQuiz)
    const [question, setQuestion] = React.useState('')
    const [imageUri, setImageUri] = React.useState('')
    const [timeAnswer, setTimeAnswer] = React.useState(10)
    const [arrAnswer, setArrAnswer] = React.useState([{
        isCorrect: false,
        answer: "",
        img: ""
    }])
    {/*false is text, true is image */ }
    const [arrOptionAnswer, setArrOptionAnswer] = React.useState([{
        isTextorImage: false
    }])
    const [isLoading, setIsLoading] = React.useState(false)

    React.useEffect(() => {
        if (route.params?.question !== undefined) {

            let arrAns = route.params.question.answerList
            let arrOptionAns = []

            setQuestion(route.params.question.question)
            setImageUri(route.params.question.backgroundImage)
            setTimeAnswer(route.params.question.time)
            setArrAnswer(arrAns)

            arrAns.map((item, index) => {
                item.answer !== "" ? arrOptionAns.push({
                    isTextorImage: false
                })
                    :
                    arrOptionAns.push({
                        isTextorImage: true
                    })
            })

            setArrOptionAnswer(arrOptionAns)
        }
    }, [])

    const handleContinue = async () => {

        //Check empty
        if (question == "") {
            ToastAndroid.show("Empty Question", ToastAndroid.SHORT)
        }
        else if (arrAnswer.length <= 1) {
            ToastAndroid.show("You need to add at least 2 answer", ToastAndroid.SHORT)
        }
        else if (arrAnswer.some(element => element.answer == "" && element.img == "")) {
            ToastAndroid.show("Empty answer", ToastAndroid.SHORT)
        }
        else if (arrAnswer.some(element => element.isCorrect == true) == false) {
            ToastAndroid.show("Choose at least 1 correct answer", ToastAndroid.SHORT)
        } else {
            if (route.params?.question !== undefined) {
                let newQuestionList = [...newQuiz.questionList]
                newQuestionList[route.params.indexQuestion] = {
                    ...newQuestionList[route.params.indexQuestion],
                    question: question,
                    time: timeAnswer,
                    backgroundImage: imageUri,
                    answerList: arrAnswer,
                }
                dispatch(updateQuestionList(newQuestionList))
                navigation.navigate(screenName.ManageQuestion)
            } else {
                setIsLoading(true)

                // Upload Image for Question
                let imageUrl = ''
                if (imageUri != '') {
                    const reference = storage().ref(imageUri.slice(imageUri.lastIndexOf("/") + 1, imageUri.length));
                    await reference.putFile(imageUri)
                    //Get url of image was upload on Firebase
                    imageUrl = await reference.getDownloadURL()
                }

                // Upload Image for Answer
                arrAnswer.map(async (item, index) => {
                    let imgUrl = ''
                    if (item.img !== '') {
                        const reference = storage().ref(item.img.slice(item.img.lastIndexOf("/") + 1, item.img.length));
                        await reference.putFile(item.img)
                        //Get url of image was upload on Firebase
                        imgUrl = await reference.getDownloadURL()

                        let newArrAnswer = [...arrAnswer]
                        newArrAnswer[index] = {
                            ...arrAnswer[index],
                            img: imgUrl
                        }
                        setArrAnswer(newArrAnswer)
                    }
                })

                //Add new Question
                dispatch(addNewQuestion({
                    questionType: "CheckBox",
                    question: question,
                    time: timeAnswer,
                    backgroundImage: imageUrl,
                    answerList: arrAnswer,
                    tempId: newQuiz.questionList.length
                }))
                ToastAndroid.show('Add success', ToastAndroid.SHORT)
                navigation.navigate(screenName.ManageQuestion)

                // Reset
                setQuestion('')
                setArrAnswer([{
                    isCorrect: false,
                    answer: "",
                    img: ""
                }])
                setImageUri('')

                setIsLoading(false)
            }

        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.scrollView}>
                <Text style={styles.title}>CheckBox</Text>
                <Text style={styles.txtNameQuiz}>{newQuiz.name}</Text>
                <FormInput
                    labelText="Question"
                    onChangeText={val => setQuestion(val)}
                    showCharCount={true}
                    value={question}
                />

                {/* Image upload */}
                <ChooseImgBTN setImageUri={setImageUri} imageUri={imageUri} />

                {/*Break line between Question and Option */}
                <View style={styles.containerLineHorizon}>
                    <View style={[styles.lineHorizon, { marginRight: 5, flex: 1 }]} />
                    <Text>answer choice</Text>
                    <View style={[styles.lineHorizon, { marginLeft: 5, flex: 5 }]} />
                </View>

                {/* Options */}
                <View>
                    {
                        arrAnswer.map((item, index) => (

                            <View key={index} style={styles.rowItemAnswer}>
                                <View style={styles.containerBtnIcons}>
                                    {/* Delete answer */}
                                    <Icon
                                        name="trash"
                                        size={20}
                                        color={COLORS.black}
                                        onPress={() => {
                                            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)

                                            let newArrAnswer = [...arrAnswer]
                                            newArrAnswer.splice(index, 1)
                                            setArrAnswer(newArrAnswer)

                                            let newArrOptionAnswer = [...arrOptionAnswer]
                                            newArrOptionAnswer.splice(index, 1)
                                            setArrOptionAnswer(newArrAnswer)
                                        }}
                                    />
                                    {/* Add image for answer */}
                                    <Icon
                                        name="image"
                                        size={20}
                                        color={COLORS.black}
                                        style={{ marginHorizontal: 40 }}
                                        disabled={item.img !== "" ? true : false}
                                        onPress={() => {
                                            LayoutAnimation.configureNext(LayoutAnimation.Presets.linear)

                                            let newArrOptionAnswer = [...arrOptionAnswer]
                                            newArrOptionAnswer[index] = { isTextorImage: true }
                                            setArrOptionAnswer(newArrOptionAnswer)

                                            let newArrAnswer = [...arrAnswer]
                                            newArrAnswer[index] = {
                                                isCorrect: false,
                                                answer: "",
                                                img: ""
                                            }
                                            setArrAnswer(newArrAnswer)
                                        }}
                                    />
                                    {/* Add text for answer */}
                                    <Icon
                                        name="text-document"
                                        size={20}
                                        color={COLORS.black}
                                        disabled={item.answer.length !== 0 ? true : false}
                                        onPress={() => {
                                            LayoutAnimation.configureNext(LayoutAnimation.Presets.linear)

                                            let newArrOptionAnswer = [...arrOptionAnswer]
                                            newArrOptionAnswer[index] = { isTextorImage: false }
                                            setArrOptionAnswer(newArrOptionAnswer)

                                            let newArrAnswer = [...arrAnswer]
                                            newArrAnswer[index] = {
                                                isCorrect: false,
                                                answer: "",
                                                img: ""
                                            }
                                            setArrAnswer(newArrAnswer)
                                        }}
                                    />
                                    {/* Choose correct answer */}
                                    <Icon1
                                        name="check-square"
                                        size={20}
                                        style={{ position: "absolute", right: 0 }}
                                        color={item.isCorrect ? COLORS.success : COLORS.gray}
                                        onPress={() => {

                                            let newArrAnswer = [...arrAnswer]
                                            newArrAnswer[index] = {
                                                ...newArrAnswer[index],
                                                isCorrect: newArrAnswer[index].isCorrect ? false : true
                                            }
                                            setArrAnswer(newArrAnswer)
                                        }}
                                    />
                                </View>
                                {
                                    arrOptionAnswer[index].isTextorImage ?
                                        // Button choose image for answer 
                                        <ChooseImgBTN setImageUri={(imgPath) => {
                                            let newArrAnswer = [...arrAnswer]
                                            newArrAnswer[index] = {
                                                ...arrAnswer[index],
                                                answer: "",
                                                img: imgPath
                                            }
                                            setArrAnswer(newArrAnswer)
                                        }}
                                            imageUri={arrAnswer[index].img} />
                                        :
                                        // TextInput to type text for answer
                                        <FormInput
                                            key={index}
                                            labelText={"Option " + index}
                                            onChangeText={val => {
                                                let newArrAnswer = [...arrAnswer]
                                                newArrAnswer[index] = {
                                                    ...newArrAnswer[index],
                                                    answer: val
                                                }
                                                setArrAnswer(newArrAnswer)
                                            }}
                                            value={item.answer}
                                            showCharCount={true} />
                                }
                            </View>
                        ))

                    }
                </View>

                {/*Break line between  Option and Time*/}
                <View style={[styles.containerLineHorizon, { marginTop: 0 }]}>
                    <View style={[styles.lineHorizon, { marginRight: 5, flex: 1 }]} />
                    <Text>time answer( second )</Text>
                    <View style={[styles.lineHorizon, { marginLeft: 5, flex: 5 }]} />
                </View>
                {/* Time option */}
                <View style={styles.containerTimeAnswer}>
                    {
                        arrTime.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.rowItemTimeAnswer, { backgroundColor: item == timeAnswer ? COLORS.primary : COLORS.white }]}
                                activeOpacity={0.6}
                                onPress={() => setTimeAnswer(item)}
                            >
                                <Text style={[styles.txtTimeAnswer, { color: item == timeAnswer ? COLORS.white : COLORS.primary }]}>{item}</Text>
                            </TouchableOpacity>
                        ))
                    }
                </View>

                {/*Button add more answer */}
                <FormButton
                    labelText="More Answer"
                    isLoading={isLoading}
                    disabled={arrAnswer.length == 4 ? true : false}
                    handleOnPress={() => {
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)

                        let newArrOptionAnswer = [...arrOptionAnswer, {
                            isTextorImage: false
                        }]
                        let newArrAnswer = [...arrAnswer, {
                            isCorrect: false,
                            answer: "",
                            img: ""
                        }]
                        setArrAnswer(newArrAnswer)
                        setArrOptionAnswer(newArrOptionAnswer)
                    }}
                    style={{
                        borderColor: arrAnswer.length == 4 ? COLORS.gray : COLORS.primary,
                        backgroundColor: arrAnswer.length == 4 ? COLORS.gray : COLORS.primary,
                        marginBottom: 20,
                    }}
                    children={
                        <View style={styles.viewIcon}>
                            <Icon
                                name={"circle-with-plus"}
                                size={20}
                                color={COLORS.white}
                            />
                        </View>
                    }
                />
                {/*Button continue to handle continue step */}
                <FormButton
                    labelText="Continue"
                    handleOnPress={handleContinue}
                    children={
                        <View style={styles.viewIcon}>
                            <Icon
                                name={"arrow-with-circle-right"}
                                size={20}
                                color={COLORS.white}
                            />
                        </View>
                    }
                />
                {/*Button cancel to go back ManageQuestion screen */}
                <FormButton
                    labelText="Cancel"
                    isPrimary={false}
                    handleOnPress={() => {
                        navigation.navigate(screenName.ManageQuestion);
                    }}
                    style={{
                        marginVertical: 20,
                    }}
                />
            </ScrollView>
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        backgroundColor: COLORS.white,
        paddingHorizontal: 20
    },
    rowItemAnswer: {
        marginBottom: 20
    },
    rowItemTimeAnswer: {
        flexGrow: 1,
        margin: 10,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 5
    },
    containerTimeAnswer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 40
    },
    containerBtnIcons: {
        flexDirection: "row",
        alignSelf: "center",
        justifyContent: "center",
        marginBottom: 15,
        width: "100%"
    },
    containerLineHorizon: {
        marginVertical: 40,
        flexDirection: "row",
        alignItems: "center"
    },
    viewIcon: {
        position: 'absolute',
        top: 0,
        left: 5,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
    txtNameQuiz: {
        textAlign: 'center',
        marginBottom: 20
    },
    txtTimeAnswer: {
        fontSize: 20,
        fontWeight: "bold"
    },
    lineHorizon: {
        borderWidth: 0.8,
        borderColor: COLORS.gray,
    },
    title: {
        fontSize: 40,
        textAlign: 'center',
        marginVertical: 20,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    img: {
        width: '100%',
        height: 200,
        borderRadius: 5,
    }
})

export default CheckBox;
