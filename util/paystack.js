import axios from 'axios';


// Create a customer and virtual Account
export const createPaystackVirtualAccount = async (email, fullname) => {
    try {
        const customer = await axios.post('https://api.paystack.co/customer', {
            email: email,
            first_name: fullname
        }, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        })
        console.log("Created Customer", customer)
        if(!customer) throw new Error("Failed to create a unique Account")

        const customerCode = customer.data.data.customer_code;

        // virtual account
        const response = await axios.post('https://api.paystack.co/dedicated_account', {
            customer: customerCode,
            preferred_bank: "wema-bank"  //check for availability of wema bank later.
        }, {
            headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
        });
        console.log("Created Dedicated Account", response)
        if(!response) {
            throw new Error("Can't create an account right now. Please try again shortly.")
        }
        const data = response.data.data;
        return { data, customerCode }
    } catch (error) {
        throw new Error(error.message)
    }
}


export const receiveFundsToVirtualAccount = () => {
    try {
        axios.post('', {
            
        })
    } catch (error) {
        throw new Error(error.message)
    }
}


export const withdrawFundsFromVirtualAccount = () => {
    try {
        axios.post('', {
            
        })
    } catch (error) {
        throw new Error(error.message)
    }
}