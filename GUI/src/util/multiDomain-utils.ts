import useStore from "../store/user/store";

const toUrlPattern = (domain: string) => {
    if (domain.includes('%')) return domain;

    const [, scheme, rest] = domain.trim().match(/^([a-z][a-z0-9+.-]*:\/\/)?(?:www\.)?(.*)$/i) ?? [];
    return `${scheme ?? '%'}%${rest}%`;
};

export const getDomainsArray = () => {
    const multiDomainEnabled = import.meta.env.REACT_APP_ENABLE_MULTI_DOMAIN?.toLowerCase() === 'true';
    const userDomains = useStore.getState().userDomains;
    if(multiDomainEnabled) {
        return userDomains?.length > 0 ? userDomains.map(toUrlPattern) : [null]
    }

    return [];
}
