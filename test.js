const str = "abcabcbb"

function check(str){
  let max = '';
  
  for(let i = 0; i<str.length; i++){
   
    let remain = str.slice(i+1)
    console.log(max,'===')
    if(remain.indexOf(max) !== -1){
      max+=str[i];
    }
    
  }
  return max
}
console.log(check(str))