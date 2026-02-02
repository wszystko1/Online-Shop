

const nav_notlogged_html = `
    <nav class="main-nav">
        <div class="nav-item">
            <a class="nav-link" href="/main">Home</a>
        </div>
        <div class="nav-item">
            <a class="nav-link" href="/about">About</a>
        </div>
        <div class="nav-item">
            <form class="nav-form">
                <input class="nav-search" name="searchQuery" type="text" placeholder="Search.." inputmode="search">
            </form>    
        </div>
        <div class="nav-item">
            <a class="nav-link" href="/login">Log in</a>
        </div>
    </nav>
`;

const nav_logged_html = `
    <nav class="main-nav">
        <div class="nav-item">
            <a class="nav-link" href="/main">Home</a>
        </div>
        <div class="nav-item">
            <a class="nav-link" href="/about">About</a>
        </div>
        <div class="nav-item">
            <form class="nav-form">
                <input class="nav-search" name="searchQuery" type="text" placeholder="Search.." inputmode="search">
            </form>    
        </div>
        <div class="nav-item">
            <div class="nav-drop">
                <a class="nav-link" href="/account">Account</a>
                <div class="nav-drop-content">
                    <a class="nav-drop-link" href="/cart">cart</a>
                    <a class="nav-drop-link" href="/log-out">log out</a>
                </div>
            </div>
        </div>
    </nav>
`;

const nav_admin_html = `
    <nav class="main-nav">
        <div class="nav-item">
            <a class="nav-link" href="/main">Home</a>
        </div>
        <div class="nav-item">
            <a class="nav-link" href="/about">About</a>
        </div>
        <div class="nav-item">
            <form class="nav-form">
                <input class="nav-search" name="searchQuery" type="text" placeholder="Search.." inputmode="search">
            </form>    
        </div>
        <div class="nav-item">
            <div class="nav-drop">
                <a class="nav-link" href="/account">Account</a>
                <div class="nav-drop-content">
                    <a class="nav-drop-link" href="/orders">orders</a>
                    <a class="nav-drop-link" href="/edit">edit</a>
                    <a class="nav-drop-link" href="/cart">cart</a>
                    <a class="nav-drop-link" href="/log-out">log out</a>
                </div>
            </div>
        </div>
    </nav>
`;


function createProdListHTML(productList) {
    let listInnerHTML = "";
    for(let i = 0; i < productList.length; i++) {
        listInnerHTML += `
        <div class="product">
            <form method="post" >
            <div class="form-grid">
            <div class="form-header">feature</div>
            <div class="form-header">edit</div>
            <label>id</label>
            <input type="text" name="id" value="${productList[i].product_id}" readonly/>
            <label>name</label>
            <input type="text" name="name" value="${productList[i].product_name}"/>

            <label>description</label>
            <input type="text" name="desc" value="${productList[i].product_desc}"/>

            <label>price</label>
            <input type="text" name="price" value="${productList[i].product_price}"/>

            <label>image</label>
            <input type="file" name="image" accept="image/png, image/jpeg"/>
            </div>
                <div class="submit-block">
                    <button class="submit-btn" type="submit" name="change" value="  ate">update</button>
                    <button class="submit-btn" type="submit" name="change" value="remove">remove</button>
                </div>
            </form>
        </div>`;
    }

    listInnerHTML += `
        <div class="product">
            <form method="post" >
                <div class="form-grid">
                    <div class="form-header">feature</div>
                    <div class="form-header">add</div>
                    
                    <label>id</label>
                    <input type="text" name="id" value=""/>

                    <label>name</label>
                    <input type="text" name="name" value=""/>

                    <label>description</label>
                    <input type="text" name="desc" value=""/>

                    <label>price</label>
                    <input type="text" name="price" value=""/>

                    <label>image</label>
                    <input type="file" name="image" accept="image/png, image/jpeg">
                </div>
                <div class="submit-block">
                    <button class="submit-btn" type="submit" name="change" value="add">add</button>
                </div>
            </form>
        </div>`;
    return listInnerHTML
};

function createProdGrid(productsList) {
    let prodSqHTML = '';
    for(product of productsList) {
        prodSqHTML += `
            <div class="product-item">
                <a class="product-link" href="/product?name=${encodeURIComponent(product.product_name)}">
                    <img class="product-image" src="${product.product_image}" width="300" height="300" alt="cactus image">
                    <figcaption class="product-name">
                        ${product.product_name}
                    </figcaption>
                    <figcaption class="product-price">
                        ${product.product_price}
                    </figcaption>
                </a>
            </div>`;
    }

    return prodSqHTML;
}

module.exports = {
    nav_notlogged_html,
    nav_admin_html,
    nav_logged_html,
    createProdGrid,
    createProdListHTML
};
