import {createStructuredSelector} from 'reselect'

export default createStructuredSelector({
    Donate: store => store.Landing.Donate,
})