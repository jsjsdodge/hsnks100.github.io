
ap_item.xml

```
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout
xmlns:android="http://schemas.android.com/apk/res/android"
android:orientation="horizontal"
android:layout_width="match_parent"
android:layout_height="match_parent">
<ImageView
    android:id="@+id/imageview"
    android:layout_width="60dp"
    android:layout_height="60dp"/>
<TextView
    android:id="@+id/textview"
    android:layout_width="wrap_content"
    android:layout_height="match_parent"
    android:gravity="center"/>
</LinearLayout>
```

main_layout.xml
```
......
        <ListView
            android:id="@+id/listview"
            android:layout_height="match_parent"
            android:layout_width="match_parent"
            android:divider="#ffcc22"
            android:dividerHeight="1.5dp"
            android:choiceMode="singleChoice" />
         
```

ListViewAdapter.xml

```
import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.ImageView;
import android.widget.TextView;

import java.util.ArrayList;

public class ListViewAdapter extends BaseAdapter {
    private LayoutInflater inflater;
    private ArrayList<ListViewItem> data;
    private int layout;
    public ListViewAdapter(Context context, int layout, ArrayList<ListViewItem> data){
        this.inflater=(LayoutInflater)context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        this.data=data;
        this.layout=layout;
    }
    @Override
    public int getCount(){return data.size();}
    @Override
    public String getItem(int position){return data.get(position).getName();}
    @Override
    public long getItemId(int position){return position;}
    @Override
    public View getView(int position, View convertView, ViewGroup parent){
        if(convertView==null){
            convertView=inflater.inflate(layout,parent,false);
        }
        ListViewItem listviewitem=data.get(position);
        ImageView icon=(ImageView)convertView.findViewById(R.id.imageview);
        icon.setImageResource(listviewitem.getIcon());
        TextView name=(TextView)convertView.findViewById(R.id.textview);
        name.setText(listviewitem.getName());
        return convertView;
    }
}
```

ListViewItem.java
```
public class ListViewItem {
    private int icon;
    private String name;
    public int getIcon(){return icon;}
    public String getName(){return name;}
    public ListViewItem(int icon,String name){
        this.icon=icon;
        this.name=name;
    }
}
```

your onCreate(...)
```
        ListView mListView = null;
        ArrayList<ListViewItem> mListData=new ArrayList<>();
        ListViewAdapter adapter=new ListViewAdapter(this,R.layout.ap_item, mListData);
        mListView.setAdapter(adapter);
```

your add part
```
mListData.add(new ListViewItem(R.drawable.b_ar_dn_1, wifiE.getString("ssid")));
ListViewAdapter lva = (ListViewAdapter)mListView.getAdapter();
lva.notifyDataSetChanged();
```

