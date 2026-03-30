
router.delete('/users/:id',     auth, c.deleteUser)

module.exports = router
