const deleteProduct = async button => {
    const productId = button.parentNode.querySelector('[name=productId]').value;
    const csrf = button.parentNode.querySelector('[name=_csrf]').value;
    const productElement = button.closest('article');
    console.log(productElement);
    try {
        // not having http in front will send request to current host
        const response = await fetch(`/admin/product/${productId}`, {
            method: 'DELETE',
            headers: {
                'csrf-token': csrf,
            },
        });
        console.log(response);
        const result = await response.json();
        productElement.parentNode.removeChild(productElement);
        console.log(result);
    } catch (err) {
        console.log(err);
    }
};
