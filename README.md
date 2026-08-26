定位不仅仅是百度地图，高德才有的功能哦，其实定位也可以再网页上来获取定位

为什么支持我们的项目？？？

因为它开源免费，定位精度也高，在室内也可达到20米误差的精度
因为它UI界面整齐，没有什么花里胡哨的按钮和界面，无广告，只需点点按钮的事就可以
因为他支持3D并且支持填入你自己的AK-但只支持百度地图的
缺点：
1.file:///不支持定位
2.http协议不让请求定位权限
3.不填ak只支持输出gps经纬度
但是，我们可以使用cloudflare-linux-amd64的程序来把http转成https协议来定位
如何使用？
1.先安装python依赖：pip install flask,有的网速慢的可以使用pip install -i 源地址 就可以改善下载速度
2.安装完得安装linux了，这里我推荐用Kalilinux来使用
先启动我们的flask项目：
python3/python return.py，这里我们的flask项目为return.py
在输入chmod +x cloudflared-linux-amd64来给协议转化程序加上可执行权限
然后再写：
./cloudflared-linux-amd64/cloudflared-linux-amd64 tunnel --url http://127.0.0.1:9999给http转https协议
然后直接输入他给的地址就可以了
你可以在迷路的时候打开它并定位
！！注意！！
cloudflared的中转地址每一次都不一样执行一次就随机生成一次，这得注意
电脑可以当作服务器，但不能关机，不然就断连
