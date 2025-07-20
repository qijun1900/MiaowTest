import router from '@/router';
export default function (path,query) {
    router.push({path:path,query:query})
}
