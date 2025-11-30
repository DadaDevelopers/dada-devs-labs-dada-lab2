
* USSD(Unstructured Supplementary Services Data) lets feature phones interact with information systems through a series of prompts.
* To interact with USSD app, a mobile user dails a special phone number called a shortcode(eb *684#) and they are presented with a list of menu options that they will use to interact with the application.

## HIT
* When someone dials USSD short-code, they are making request to start a session with the information system. This request is facilitated by a mobile network operator(MNO) such as Safaricom, Airtel
* Once received,a MNO will forward the request to a third party application server registered with that short code. This connection opens a bridge of communication that will last until the session is terminated or timed out.

NB
* A USSD gateway is a riuting server that directs information sent from mobile phone to a third party application.
* An application can register with gateway so that when information is passed to s short code, its forwaded to a URL via HTTP POST request.

#### Open Questions
This is simple in theory, but becomes more complicated when you factor in multiple different competing networks in an area, each with their own USSD Gateway. We want our application to work with all networks in an area which means we must register our shortcode with each MNO our users might have.

* To prevent us from needing to manage our application gateway registration for each network nprovider individually, we can use an aggregation service. Typically the aggregator would be determined by which companies have integrated with the MNOs in the region. For our usecase we will use africaistalking aggregation service because they provide a nice and free sandbox/simulator environment and have tools to simplify integration.

<><><>

### High Level Flow
1. User dials USSd code(eg *654#)
2. Request hits africa is talking ussd gateway
3. Africa's talking forwared the request to the backend REST endpoint
4. The backend responds with CON(continue session) or END(terminate session)
5. Africa's talking displays the response to the user


---

# THE USSD FLOW

---

```shell


            +-----------------------------------+
            |  User dials *384*60397#           |
            +-------------+---------------------+
                          |
                          v
                +--------------------------+
                |   MAIN MENU              |
                | 1. My Chamas             |
                | 2. Contribute/Save       |
                | 3. Check Balances        |
                | 4. Wallet                |
                | 5. Learn Bitcoin         |
                | 6. Discover Chamas       |
                | 7. Create Account/Chama  |
                +--------------------------+

            MAIN → (1) My Chamas
                    |
                    v
            +----------------------+
            | If >1 chama:         |
            |  Select Chama        |
            +----------+-----------+
                        |
                        v
                +------------------------+
                |   CHAMA MENU          |
                | 1. View Contributions |
                | 2. Chama Balance      |
                | 3. Withdraw           |
                | 4. Members            |
                | 5. Back               |
                +----------+------------+
                            |
                            +----> Back to MAIN


                    Chama Menu → (1) View Contributions
                            |
                            v
                    +-------------------------------+
                    |  Show contribution summary    |
                    |  END                          |
                    +-------------------------------+

                    Chama Menu → (2) Chama Balance
                            |
                            v
                    +-------------------------------+
                    | Show balance + recent activity|
                    | END                           |
                    +-------------------------------+


                    Chama Menu → (3) Withdraw
                            |
                            v
                    +------------------------------+
                    | Enter amount                 |
                    +--------------+---------------+
                                    |
                                    v
                            +----------------------+
                            | Confirm withdrawal?  |
                            | 1. Yes               |
                            | 2. No                |
                            +----------+-----------+
                                        |
                                        v
                                +-----------+
                                | Process   |
                                | END       |
                                +-----------+


            MAIN → (2) Contribute/Save
                    |
                    v
            +------------------------------+
            | Select Chama                 |
            +--------------+---------------+
                            |
                            v
                +-------------------------+
                | Enter Amount (KES)      |
                +-------------+-----------+
                                |
                                v
                    +-----------------------------+
                    | CONFIRM CONTRIBUTION?       |
                    | 1. Yes                      |
                    | 2. Cancel                   |
                    +-------------+---------------+
                                |
                                v
                        +------------------+
                        | Process Payment  |
                        | END              |
                        +------------------+

            MAIN → (3) Check Balances
                    |
                    v
            +---------------------------+
            | 1. My Contributions       |
            | 2. My Chama Balances      |
            | 3. Wallet Balance         |
            | 4. Back                   |
            +---------------------------+

Each option leads to a simple end screen: Option → Fetch Value → END


            MAIN → (4) Wallet
                    |
                    v
            +---------------------------+
            | 1. Wallet Balance         |
            | 2. Send                   |
            | 3. Receive                |
            | 4. Back                   |
            +---------------------------+


                    Wallet → (2) Send
                            |
                            v
                    +------------------------------+
                    | Enter recipient phone/ID     |
                    +--------------+---------------+
                                    |
                                    v
                        +--------------------------+
                        | Enter amount             |
                        +-------------+------------+
                                    |
                                    v
                            +------------------------+
                            | Confirm send?          |
                            | 1. Yes                 |
                            | 2. No                  |
                            +-----------+------------+
                                        |
                                        v
                            +----------------+
                            | Process → END  |
                            +----------------+


                    Wallet → (3) Receive
                            |
                            v
                    +------------------------------+
                    | Display receiving code/ID    |
                    | END                          |
                    +------------------------------+

            MAIN → (5) Learn Bitcoin
                    |
                    v
            +------------------------------+
            | 1. What is Bitcoin?          |
            | 2. Why Bitcoin for Chamas?   |
            | 3. How Savings Work          |
            | 4. Safety Tips               |
            | 5. Back                      |
            +------------------------------+

Any selectable item: Option → Show brief lesson → END


            MAIN → (6) Discover Chamas
                    |
                    v
            +----------------------------+
            | 1. Trending Chamas         |
            | 2. Nearby Chamas           |
            | 3. Search by Name          |
            | 4. Back                    |
            +----------------------------+

                    Search by Name

                    Discover → (3) Search by Name
                            |
                            v
                    +-----------------------------+
                    | Enter name search text      |
                    +-------------+---------------+
                                |
                                v
                    +---------------------------+
                    | Show results → END        |
                    +---------------------------+


If unregistered

            MAIN → (7) Create Account
                    |
                    v
            +---------------------------+
            | Enter Name                |
            +-------------+-------------+
                            |
                            v
            +---------------------------+
            | Enter PIN                 |
            +-------------+-------------+
                            |
                            v
                +-----------------------+
                | Account Created → END |
                +-----------------------+


If registered (Create or Join)

            MAIN → (7) Create Account/Chama
                    |
                    v
            +-------------------------------+
            | 1. Create Chama               |
            | 2. Join Chama (Code)         |
            | 3. Back                       |
            +-------------------------------+

Create Chama

            Create Chama → Enter Chama Name
                        |
                        v
                Confirm? → Yes → END
                            No  → Back


Join Chama

            Join → Enter Chama Code
                |
                v
            Validate → END

```
