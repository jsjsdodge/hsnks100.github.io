# beast library
Beast is one of the c++ network library types. beast library belongs to boost libraries(Everyone knows boost).

Beast is a C++ header-only library which provides low-level HTTP[s], Websocket, and networking protocols. Also it supports asynchronous model of boost::asio.

I will deal with asynchoronous model because power of boost::asio comes from asynchronous model.

Boost 1.66.0 includes beast library.

You can get boost libraries at boost official site.

# beast websocket async example
```cpp
#pragma once
#include <boost/beast/websocket.hpp>
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
#include <boost/asio.hpp>
#include <boost/bind.hpp>

using tcp = boost::asio::ip::tcp;               // from <boost/asio/ip/tcp.hpp>
namespace websocket = boost::beast::websocket;  // from <boost/beast/websocket.hpp>
static void fail2(boost::system::error_code ec, char const* what) {
    std::cerr << what << ": " << ec.message() << "\n";
}

// Sends a WebSocket message and prints the response
class SignalSession : public std::enable_shared_from_this<SignalSession>
{
public:
    tcp::resolver resolver_;
    websocket::stream<tcp::socket> ws_;
    boost::beast::multi_buffer buffer_;
    std::string host_;
    std::string text_;

public:
    // Resolver and socket require an io_service
    explicit
    SignalSession(boost::asio::io_service& ioc) : resolver_(ioc) , ws_(ioc) {
    }

    // Start the asynchronous operation
    void connectSignalServer( char const* host, char const* port, char const* text) {
        // Save these for later
        host_ = host;
        text_ = text;

        // Look up the domain name
        resolver_.async_resolve({host, port},
                                std::bind(
                                    &SignalSession::on_resolve,
                                    shared_from_this(),
                                    std::placeholders::_1,
                                    std::placeholders::_2));
        //resolver_.async_resolve(
            //{host, port},
            //boost::bind(&SignalSession::on_resolve, shared_from_this(), 
                        //boost::asio::placeholders::error, 
                        //boost::asio::placeholders::results));

            //boost::bind(
                //&SignalSession::on_resolve,
                //shared_from_this(),
                //std::placeholders::_1,
                //std::placeholders::_2));
    }

    void on_resolve( boost::system::error_code ec, tcp::resolver::iterator result) {
        if(ec) {
            return fail2(ec, "resolve");
        }

        // Make the connection on the IP address we get from a lookup
        boost::asio::async_connect(
            ws_.next_layer(),
            result,
            std::bind(
                &SignalSession::on_connect,
                shared_from_this(),
                std::placeholders::_1));
    } 

    void on_connect(boost::system::error_code ec) {
        if(ec) {
            return fail2(ec, "connect");
        }

        auto self1 = shared_from_this();
        auto self2 = shared_from_this();
        ws_.async_handshake_ex(host_, "/", 

                        [self1](websocket::request_type& req) {
                            req.insert("auth", "someAuth");
                        },
                        [self2](boost::system::error_code ec) {
                            if(ec) {
                                return fail(ec, "handshake");
                            }
                        });
    } 

    void on_handshake(boost::system::error_code ec) {
        if(ec)
        {
            return fail2(ec, "handshake");
        }

        ws_.async_read(
            buffer_,
            std::bind(
                &SignalSession::on_read,
                shared_from_this(),
                std::placeholders::_1,
                std::placeholders::_2));
        // Send the message
        //
        ws_.async_write(
            boost::asio::buffer(text_),
            std::bind(
                &SignalSession::on_write,
                shared_from_this(),
                std::placeholders::_1,
                std::placeholders::_2));
    }
    void on_write( boost::system::error_code ec, std::size_t bytes_transferred) {
        boost::ignore_unused(bytes_transferred);

        if(ec) {
            return fail2(ec, "write");
        }
        
        // Read a message into our buffer
    }

    void on_read( boost::system::error_code ec, std::size_t bytes_transferred) {
        boost::ignore_unused(bytes_transferred);

        if(ec) {
            return fail2(ec, "read");
        }

        std::cout << "received: " << boost::beast::buffers(buffer_.data()) << std::endl << "---------------\n";
        buffer_.consume(buffer_.size());
        static int i = 0;
        std::string sendingText = text_ + std::to_string(i++);
        ws_.async_write(
            boost::asio::buffer(sendingText),
            boost::bind(
                &SignalSession::on_write,
                shared_from_this(),
                boost::asio::placeholders::error, 
                boost::asio::placeholders::bytes_transferred));

        ws_.async_read(
            buffer_,
            boost::bind(
                &SignalSession::on_read,
                shared_from_this(),
                boost::asio::placeholders::error, 
                boost::asio::placeholders::bytes_transferred));
        // Close the WebSocket connection
    }

    void on_close(boost::system::error_code ec) {
        if(ec) {
            return fail2(ec, "close");
        }

        // If we get here then the connection is closed gracefully

        // The buffers() function helps print a ConstBufferSequence
        std::cout << boost::beast::buffers(buffer_.data()) << std::endl;
    }
};
```
# using lambda instead of boost::bind

```cpp
auto self = shared_from_this();
ws_.async_write(
    boost::asio::buffer(sendingText),
    [self](boost::system::error_code ec,
std::size_t bytes_transferred) {
	std::cout << "send data size: " << bytes_transferred << std::endl; 
    });
```
Note that auto self = shared_from_this();

You have to shared_from_this() to avoid io_service's terminating.
