This is simple async http request example.

```cpp
#pragma once

#include <boost/beast/core.hpp>
#include <boost/beast/http.hpp>
#include <boost/beast/version.hpp>
#include <boost/asio/connect.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <boost/asio.hpp>
#include <cstdlib>
#include <functional>
#include <iostream>
#include <memory>
#include <string>
#include <sstream>

using tcp = boost::asio::ip::tcp;       // from <boost/asio/ip/tcp.hpp>
namespace http = boost::beast::http;    // from <boost/beast/http.hpp>

//------------------------------------------------------------------------------

// Report a failure

// custom error conditions enum type:

class HTTPSession : public std::enable_shared_from_this<HTTPSession>
{
    tcp::resolver resolver_;
    tcp::socket socket_;
    boost::beast::flat_buffer buffer_; // (Must persist between reads)
    http::request<http::string_body> req_;
    http::response<http::string_body> res_; 
    boost::asio::deadline_timer m_httpTimeout;
public:
    void fail(boost::system::error_code ec, char const* what)
    {
        printf("fail what: %s\n", what);
        //std::cerr << what << ": " << ec.message() << "\n";
    }
    virtual ~HTTPSession() {
        printf("delete HTTPSession\n");
    }
    // Resolver and socket require an io_service
    explicit
    HTTPSession(boost::asio::io_service& ios)
        : resolver_(ios)
        , socket_(ios),
        m_httpTimeout(ios, boost::posix_time::seconds(1000))
    {
    }

    //static void async_http_request( 
        //boost::asio::io_service& ios,
        //char const* host,
        //const std::string& port,
        //char const* target,
        //const std::string& body, 
        //std::function<void(std::string, boost::system::error_code)> onRead) { 
        //printf("request\n");

        //// Launch the asynchronous operation
        //std::make_shared<HTTPSession>(ios)->run(host, port, target, body, onRead); 
        //// Run the I/O service. The call will return when
        //// the get operation is complete.
        ////ios.run();
    //}
    static void request( 
        boost::asio::io_service& ios,
        char const* host,
        const std::string& port,
        char const* target,
        const std::string& body, 
        std::function<void(std::string, boost::system::error_code)> onRead, 
        const int timeout = 10) { 
        printf("request\n");

        // Launch the asynchronous operation

        std::make_shared<HTTPSession>(ios)->post(host, port, target, body, onRead, timeout); 
        // Run the I/O service. The call will return when
        // the get operation is complete.
        //ios.run();
    }

    int checkDeadline(const boost::system::error_code& ec) {
        if(ec) {
            printf("deadline cancled!!\n");
            return 0;
        }
        printf("deadline timeout T_T!!\n");
        socket_.close();
        return 0;
    }
    // Start the asynchronous operation
    void
    post(
        char const* host,
        const std::string& port,
        char const* target,
        const std::string& body, 
        std::function<void(std::string, boost::system::error_code)> onRead,
        const int timeout = 10
        )
    {
        printf("line : %d\n", __LINE__);
        // Set up an HTTP GET request message
        req_.version(11);
        req_.method(http::verb::post);
        req_.target(target);
        req_.set(http::field::host, host);
        req_.set(http::field::user_agent, BOOST_BEAST_VERSION_STRING);
        req_.set(http::field::content_type, "application/json");
        req_.body() = body;
        req_.prepare_payload();
        //m_httpTimeout.expires_at(boost::posix_time::pos_infin); 
        m_httpTimeout.expires_from_now(boost::posix_time::seconds(timeout));
        m_httpTimeout.async_wait(boost::bind(&HTTPSession::checkDeadline, this, boost::asio::placeholders::error));
        // Look up the domain name
        auto self = shared_from_this();
        resolver_.async_resolve(
            {host, port}, 
            [this, onRead, self, timeout](
                const boost::system::error_code& ec,
                const tcp::resolver::iterator& result) {
                m_httpTimeout.cancel();
                if(ec) {
                    onRead("not resolved", ec);
                    return fail(ec, "resolve!!!"); 
                }

                //boost::asio::async_connect(socket_, result,
                                           //std::bind(
                                               //&session::on_connect,
                                               //shared_from_this(),
                                               //std::placeholders::_1));
                m_httpTimeout.expires_from_now(boost::posix_time::seconds(timeout));
                m_httpTimeout.async_wait(boost::bind(&HTTPSession::checkDeadline, this, boost::asio::placeholders::error));
                auto self2 = shared_from_this();
                boost::asio::async_connect(
                    socket_, result,
                    [this, onRead, self2, timeout](boost::system::error_code ec, tcp::resolver::iterator)
                    {
                        m_httpTimeout.cancel();
                        if(ec)
                        {
                            onRead("not connected", ec);
                            return fail(ec, "not connect!!!");
                        }

                        printf("on connect\n");
                        // Send the HTTP request to the remote host
                        m_httpTimeout.expires_from_now(boost::posix_time::seconds(timeout));
                        m_httpTimeout.async_wait(boost::bind(&HTTPSession::checkDeadline, this, boost::asio::placeholders::error));
                        auto self3 = shared_from_this();
                        http::async_write(
                            socket_, req_,
                            [this, onRead, self3, timeout](
                                boost::system::error_code ec,
                                std::size_t bytes_transferred)
                            {
                                m_httpTimeout.cancel();
                                boost::ignore_unused(bytes_transferred);

                                if(ec)
                                {
                                    onRead("failed to write", ec);
                                    return fail(ec, "failed to write");
                                }

                                // Receive the HTTP response
                                m_httpTimeout.expires_from_now(boost::posix_time::seconds(timeout));
                                m_httpTimeout.async_wait(boost::bind(&HTTPSession::checkDeadline, this, boost::asio::placeholders::error));
                                auto self4 = shared_from_this();
                                http::async_read(
                                    socket_, buffer_, res_,
                                    [this, onRead, self4, timeout](boost::system::error_code ec, std::size_t bytes_transferred) {
                                        m_httpTimeout.cancel();
                                        boost::ignore_unused(bytes_transferred);
                                        bool successStatus = 200 <= res_.result_int() && res_.result_int() < 300;
                                        std::ostringstream oss;
                                        oss << res_.body(); 
                                        socket_.shutdown(tcp::socket::shutdown_both, ec); 

                                        if(ec) {
                                            onRead("", ec);
                                        }
                                        else if(successStatus == false) {
                                            auto makeEc = boost::system::error_code(static_cast<int>(res_.result_int()), 
                                                                                    theHTTPCategory); 
                                                                                    //boost::system::generic_category());
                                            onRead(oss.str(), makeEc); 
                                        } 
                                        else {
                                            onRead(oss.str(), ec);
                                        }

                                    });
                            });
                    });
            }); 
    }
};
```
