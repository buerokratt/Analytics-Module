export const getShowTestData = () => {
    return import.meta.env.REACT_APP_SHOW_TEST_CONVERSATIONS?.toLowerCase() === 'true';
}