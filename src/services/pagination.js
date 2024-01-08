export function pagination(page,limit){
if(!page||page<=0){
    page=1;
}
if(!limit||limit<=0){
    limit=4;
}
const skip=(page-1)*limit;
return {skip,limit};

}