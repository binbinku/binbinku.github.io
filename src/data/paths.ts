export const href = (path = '') => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
export const postHref = (id: string) => href(`blog/${id}/`);
export const tagHref = (tag: string) => href(`tags/${encodeURIComponent(tag)}/`);
export const formatDate = (date: Date) => new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Shanghai' }).format(date).replaceAll('/', '.');
