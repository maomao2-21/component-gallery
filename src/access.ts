/*
 * @Description: 
 * @Version: 2.0
 * @Autor: Mao 
 * @Date: 2022-01-19 16:46:36
 * @LastEditors: Mao 
 * @LastEditTime: 2022-02-17 11:15:49
 */
/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: { currentUser?: API.CurrentUser | undefined }) {
  const { currentUser } = initialState || {};
  return {
    canAdmin: currentUser && currentUser.access === 'admin',
  };
}
