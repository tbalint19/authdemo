const mySecretKey = 5

const signedByMe = (str) => {

    const abc = "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz"
  
    let signature = ""
    for (const letter of str) {
      const indexInAbc = abc.indexOf(letter)
      signature += abc[indexInAbc + mySecretKey]
    }
  
    return str + "::" + signature
}

const verifyByMe = (str) => {
    const payload = str.split("::")[0]
    const signature = str.split("::")[1]

    const abc = "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz"
    let original = ""
    for (const letter of signature) {
        const indexInAbc = abc.indexOf(letter)
        original += abc[26 + indexInAbc - mySecretKey]
    }

    return original === payload
}

const username = "john"
const signed = signedByMe(username)
// jane::mdqh
console.log(signed)
const isOk = verifyByMe("john::mdqh")
console.log(isOk)