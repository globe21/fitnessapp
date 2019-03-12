import React, {Component} from 'react';
import {connect} from 'react-redux';
import moment from 'moment';
import selectors from './selectors';
import i18n from '../../../i18n';
import {Button, Card, Text, View} from 'react-native-ui-lib';
import {Image, ScrollView, StyleSheet} from "react-native";
import FetchTrainings from "../actions/FetchTrainings";
import Logo from "../../../../assets/images/landing-logo-inverted.png";
import {Navigation} from "react-native-navigation";
import {objectValues, sortByDate} from "../../../utils";
import {rm} from "../../../storage/fs";
import FadeInView from "../../../components/FadeIn";
import {ADD_DISPLAYED_MONTH} from "../actions";
import {imageMap} from "../../../assets";
import {navigateToTraining} from "../../../router";

type Props = {};

class Landing extends Component<Props> {

    constructor(props) {
        super(props)

        Navigation.events().bindComponent(this);
    }

    componentDidAppear() {
        this.props.dispatch(FetchTrainings())
    }

    openTraining = training => () => {
        navigateToTraining(this.props.componentId, training)
    }

    addTraining = () => {
        navigateToTraining(this.props.componentId, null)
    }

    getPrevMonth = () => {
        const {months} = this.props.Landing

        const lastMonth = months[months.length - 1]

        return moment(lastMonth, 'YYYY-MM-01').subtract(1, 'month').format('YYYY-MM')
    }

    addMonth = () => {
        this.props.dispatch({
            type: ADD_DISPLAYED_MONTH,
            payload: this.getPrevMonth()
        })
    }

    renderTraining = (item, key) => {

        return <Card
            key={key}
            row
            height={50}
            onPress={this.openTraining(item.id)}
            marginB-10>

            <View padding-10 flex>
                <Text text80 dark10 numberOfLines={1}>
                    {moment(item.startedAt, 'YYYY-MM-DD HH:mm').format('DD.MM HH:mm')}, {item.totalWeightPerHour}
                </Text>

                {item.muscleGroups
                    ? <View left flex>
                        <Text text90 blue20 numberOfLines={1}>
                            {item.muscleGroups.map(name => i18n.t('muscle_groups.' + name)).join('; ')}
                        </Text>
                    </View>
                    : null}
            </View>

            {item.image
                ? <Card.Image
                    width={50}
                    height={50}
                    imageSource={imageMap[item.image]()}/>
                : null}
        </Card>
    }

    render() {

        const {trainings, months} = this.props.Landing

        const prevMonth = this.getPrevMonth()

        const hasMore = trainings[prevMonth] !== undefined

        let displayedItems = {}

        months.forEach(month => {
            if (trainings[month] !== undefined) {
                displayedItems = {
                    ...displayedItems,
                    ...trainings[month]
                }
            }
        })

        const items = objectValues(displayedItems)

        sortByDate(items, 'startedAt', 'DESC')

        return <View flex padding-10>

            <View centerH>
                <Image source={Logo}
                       resizeMethod="scale"
                       style={styles.image}/>
            </View>

            <FadeInView style={styles.container}>

                <ScrollView style={styles.scroll}>

                    <Button marginB-10
                            onPress={this.addTraining}>
                        <Text>{i18n.t('landing.start_session')}</Text>
                    </Button>

                    {items.map(this.renderTraining)}

                    {items.length > 0
                        ? <Button marginB-10
                            disabled={!hasMore}
                            onPress={this.addMonth}>
                        <Text>{i18n.t('landing.show_more')}</Text>
                    </Button>
                        : null}

                    <Button link marginB-10
                            onPress={() => {
                                rm('/trainingRegistry.json').catch(() => {
                                })

                                items.forEach(item => {
                                    rm('/trainings/' + item.id + ".json").catch(() => {
                                    })
                                })
                            }}>
                        <Text red10>remove all</Text>
                    </Button>

                </ScrollView>

            </FadeInView>
        </View>
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    scroll: {
        height: '100%'
    },
    image: {
        position: 'absolute',
        bottom: -475,
        width: 775 / 3.5,
        height: 1000 / 3.5
    }
})

export default connect(selectors)(Landing);
