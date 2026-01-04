# Test Fixes TODO

## Product Tests (3 failures)
- [ ] Fix "should filter products by min price" - ensure test data is created properly
- [ ] Fix "should filter products by max price" - ensure test data is created properly
- [ ] Fix "should return product by id" - ensure product exists in database

## Order Tests (6 failures)
- [ ] Fix "should create order successfully" - update success message in order service
- [ ] Fix "should return 400 if product does not exist" - add proper product validation
- [ ] Fix "should return 400 if quantity exceeds stock" - add stock validation
- [ ] Fix "should return user orders" - fix foreign key constraint error
- [ ] Fix "should return 403 if user tries to access another user order" - fix access control logic
- [ ] Fix "should create tracking record when order is created" - ensure tracking is created

## Cart Tests (7 failures)
- [ ] Fix "should return empty cart for new user" - fix response structure
- [ ] Fix "should add product to cart" - fix response structure
- [ ] Fix "should update quantity if product already in cart" - fix test logic
- [ ] Fix "should return 400 if quantity exceeds stock" - add stock validation
- [ ] Fix "should delete cart item" - fix response structure
- [ ] Fix "should clear entire cart" - fix response structure
- [ ] Fix "should calculate cart total correctly" - fix response structure
