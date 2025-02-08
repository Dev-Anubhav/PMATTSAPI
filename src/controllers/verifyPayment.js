const { PayData } = require("../../payu.config.js");
const { supabase } = require("../Supabase/supabase.js");

exports.verifyPayment = async (req, res) => {
    try {
        const { txnid } = req.params;

        // Verify transaction with PayU
        const verifiedData = await PayData.payuCLient.verifyPayment(txnid);
        const data = verifiedData.transaction_details[txnid];
        console.log(data)

        if (!data) {
            return res.status(400).json({ msg: "Invalid transaction ID" });
        }

        const paymentStatus = data.status === "success" ? "success" : "failure";
        const transactionMode = data.mode || null; // Payment mode (e.g., Netbanking, UPI, Card)
        const payUReferenceId = data.mihpayid || null; // Unique PayU reference ID

        // Fetch the transaction from Supabase
        const { data: transaction, error } = await supabase
            .from("transactions")
            .select("*")
            .eq("txnid", txnid)
            .single();

        if (error || !transaction) {
            return res.status(404).json({ msg: "Transaction not found in database" });
        }

        // Update transaction details in Supabase
        const { error: updateError } = await supabase
            .from("transactions")
            .update({
                status: paymentStatus,
                transaction_mode: transactionMode,
                payureference_id: payUReferenceId
            })
            .eq("txnid", txnid);

        if (updateError) {
            return res.status(500).json({ msg: "Failed to update transaction status", error: updateError.message });
        }

        // Redirect user based on payment status
        if (paymentStatus === "success") {
            res.redirect(`http://localhost:8080/payment/success`);
        } else {
            res.redirect(`http://localhost:8080/payment/failure`);
        }
    } catch (error) {
        console.error("Payment verification error:", error);
        res.status(500).json({ msg: "Verification failed", error: error.message });
    }
};
