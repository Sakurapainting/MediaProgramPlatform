        // MQTT服务器设置
        String brokerHost = preferencesManager.getBrokerHost();
        if (!TextUtils.isEmpty(brokerHost)) {
            brokerHostEditText.setText(brokerHost);
        } else {
            brokerHostEditText.setText("broker.emqx.io"); // 使用EMQX默认服务器
        }
        
        int brokerPort = preferencesManager.getBrokerPort();
        if (brokerPort > 0) {
            brokerPortEditText.setText(String.valueOf(brokerPort));
        } else {
            brokerPortEditText.setText("1883"); // 标准MQTT端口
        }
