import useStore from "../store/user/store";

export const getDomainsArray = () => {
    const multiDomainEnabled = import.meta.env.REACT_APP_ENABLE_MULTI_DOMAIN?.toLowerCase() === 'true';
    const userDomains = useStore.getState().userDomains;
    if(multiDomainEnabled) {
        return userDomains?.length > 0 ? userDomains : [null]
    }

    return [];
}