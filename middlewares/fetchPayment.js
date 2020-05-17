module.exports = async (req, res, next) => {
    // Récupération des paiements pour le membre
    req.member = req.client.db.get(req.params.memberID);
    if(!req.member) return res.render("error");
    // Récupération du paiement en question
    req.payment = req.member.find((p) => p.id === req.params.paymentID);
    if(!req.payment) return res.render("error");
    if(req.payment.paid) req.query.error = "already_paid";
    return next();
};