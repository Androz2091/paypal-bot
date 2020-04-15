module.exports = async (req, res, next) => {
	// Collection of payments for the member
	req.member = req.client.db.get(req.params.memberID);
	if(!req.member) return res.render('error');
	// Recovery of the payment in question
	req.payment = req.member.find((p) => p.id === req.params.paymentID);
	if(!req.payment) return res.redirect('error');
	if(req.payment.paid) req.query.error = 'already_paid';
	return next();
};