import { ref, onMounted } from 'vue';

export function useMapCommon(props, emit) {
    const statusBarH = ref(0);
    const customBarH = ref(0);
    const currentAddress = ref('');
    const searchValue = ref('');
    const markers = ref([]);
    const searchList = ref([]);
    const lat = ref(props.latitude);
    const long = ref(props.longitude);
    const currentPoi = ref({});
    
    // 由组件设置的回调
    let getAddressCallback = null;
    const setGetAddress = (fn) => {
        getAddressCallback = fn;
    };

    const initSystemInfo = () => {
        uni.getSystemInfo({
            success: function(e) {
                statusBarH.value = e.statusBarHeight + 5;
                if (uni.getMenuButtonBoundingClientRect) {
                    let custom = uni.getMenuButtonBoundingClientRect();
                    customBarH.value = custom.height + 5;
                } else {
                    customBarH.value = 30;
                }
            },
        });
    };

    const updateMarker = () => {
        markers.value = [{
            ...props.marker,
            longitude: long.value,
            latitude: lat.value
        }];
    };

    const close = () => {
        emit('close');
    };

    const submit = () => {
        if (props.disable) return;
        if (!currentAddress.value) return;
        emit('confirm', currentPoi.value);
    };
    
    const onMapTap = (e) => {
        const { latitude, longitude } = e.detail;
        if (!latitude || !longitude) return;
        searchValue.value = '';
        if (getAddressCallback) getAddressCallback([longitude, latitude]);
    };

    const onPoiTap = (e) => {
        const { latitude, longitude } = e.detail;
        if (!latitude || !longitude) return;
        if (getAddressCallback) getAddressCallback([longitude, latitude]);
    };
    
    const selectItem = (item) => {
        searchValue.value = item.title;
        if (getAddressCallback) getAddressCallback([item.longitude, item.latitude]);
    };

    onMounted(() => {
        initSystemInfo();
    });

    return {
        statusBarH,
        customBarH,
        currentAddress,
        searchValue,
        markers,
        searchList,
        lat,
        long,
        currentPoi,
        setGetAddress,
        updateMarker,
        close,
        submit,
        onMapTap,
        onPoiTap,
        selectItem
    };
}
