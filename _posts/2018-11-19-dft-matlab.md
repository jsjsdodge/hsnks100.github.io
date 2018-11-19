![image](https://user-images.githubusercontent.com/3623889/48694834-d0bdac00-ec20-11e8-8572-56da94cc145e.png)


```matlab

N0 = 32;  % Sampling time

t = 0:N0-1;

 

% Initial fk: square wave

fk0 = [zeros(4,1); ones(8, 1); zeros(8,1);ones(12,1)]; 
%fk0 = sin(t/5) * 10;
fk = zeros(N0,1);   % recovered wave 
Fr = zeros(N0,1);   % frequency space 
 
% Fourier transform 
for r=0:N0-1 
    p_sum = 0; % partial sum 
    for k=0:N0-1 
        p_sum = p_sum + fk0(k+1)*exp(-1j*r*2*pi/N0*k); 
    end 

    % remove some freq
    if mod(r+1, 4) != 0
        Fr(r+1) = p_sum; 
    end
end 

% Inverse Fourier transform 
for k=0:N0-1 
    p_sum=0; % partial sum 
    for r=0:N0-1 
        p_sum = p_sum + Fr(r+1)*exp(1j*r*2*pi/N0*k); 
    end 
    fk(k+1) = p_sum/N0; 
end

% plot 
figure(1); 
subplot(4,1,1); 
stem(t,fk0); 
set(gca,'Fontsize',14); 
xlabel('k');ylabel('fk'); 
subplot(4,1,2);
stem(t,Fr);
set(gca,'Fontsize',14);
xlabel('r');ylabel('Fr');

subplot(4,1,3);
stem(t,fk);
set(gca,'Fontsize',14);
xlabel('k');ylabel('fk (recovered)');


```


